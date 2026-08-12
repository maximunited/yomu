import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { createClerkClient } from '@clerk/backend';
import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { loadClerkE2EEnv } from './helpers/clerk-env';
import { seedBenefitGoldenPath } from './helpers/seed-benefit-golden-path';
import {
  disconnectE2EPrisma,
  seedE2EUserWithDOB,
} from './helpers/seed-e2e-user';

loadClerkE2EEnv();

setup.describe.configure({ mode: 'serial' });

const authDir = path.join(__dirname, '../../playwright/.clerk');
const authFile = path.join(authDir, 'user.json');

async function ensureE2EUser(email: string, password?: string) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY is required for e2e auth setup');
  }

  const client = createClerkClient({ secretKey });
  const existing = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  if (!password) {
    throw new Error(
      `No Clerk user for ${email}. Create one in the Dashboard or set E2E_CLERK_USER_PASSWORD so setup can create it.`
    );
  }

  return client.users.createUser({
    emailAddress: [email],
    password,
    skipPasswordChecks: true,
  });
}

setup('global clerk setup', async () => {
  await clerkSetup();
});

setup('authenticate and save storage state', async ({ page }) => {
  const email = process.env.E2E_CLERK_USER_EMAIL;
  const password = process.env.E2E_CLERK_USER_PASSWORD;
  setup.skip(
    !email,
    'Set E2E_CLERK_USER_EMAIL in .env.local to enable authenticated e2e'
  );

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required for authenticated e2e (Prisma DOB seed hard-fails without it)'
    );
  }
  if (process.env.E2E_ALLOW_DB_SEED !== '1') {
    throw new Error(
      'E2E_ALLOW_DB_SEED=1 is required for authenticated e2e Prisma seeding ' +
        '(DOB upsert + golden-path brands). Use a disposable/local database only.'
    );
  }

  const clerkUser = await ensureE2EUser(email!, password);

  // Hard-fail: auth smoke must not green-pass without benefit-capable DOB
  try {
    const { id: userId } = await seedE2EUserWithDOB({
      clerkId: clerkUser.id,
      email: email!,
      name: 'E2E Test User',
    });
    // Seed once here (not in parallel worker beforeAll) to avoid duplicate brands
    await seedBenefitGoldenPath(userId);
  } finally {
    await disconnectE2EPrisma();
  }

  fs.mkdirSync(authDir, { recursive: true });

  // Must land on a page that loads Clerk before signIn
  await page.goto('/');
  await clerk.loaded({ page });

  await clerk.signIn({
    page,
    emailAddress: email!,
  });

  await page.goto('/dashboard');
  await page.waitForURL(/dashboard/, { timeout: 30000 });
  // Wait until profile API succeeds (proves session cookies work)
  await page.waitForResponse(
    (res) => res.url().includes('/api/user/profile') && res.status() === 200,
    { timeout: 30000 }
  );

  await page.context().storageState({ path: authFile });
});
