import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { createClerkClient } from '@clerk/backend';
import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { loadClerkE2EEnv } from './helpers/clerk-env';

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

  await ensureE2EUser(email!, password);

  // Ensure Prisma row has DOB so dashboard benefit logic can run
  try {
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({
      adapter: new PrismaPg(pool),
    });
    await prisma.user.updateMany({
      where: { email },
      data: {
        dateOfBirth: new Date('1990-07-15T12:00:00.000Z'),
        name: 'E2E Test User',
      },
    });
    await prisma.$disconnect();
    await pool.end();
  } catch (err) {
    console.warn('Could not seed e2e user DOB:', err);
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
