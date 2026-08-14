#!/usr/bin/env node
/**
 * Conditionally run Prisma DB push
 * Skips if SKIP_DB_PUSH environment variable is set
 */

const { spawnSync } = require('child_process');

if (process.env.SKIP_DB_PUSH || process.env.VERCEL) {
  console.log('⏭️  Skipping database push (SKIP_DB_PUSH or VERCEL is set)');
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('⏭️  Skipping database push (DATABASE_URL not set)');
  process.exit(0);
}

try {
  console.log('📦 Pushing Prisma schema to database...');

  const result = spawnSync(
    'npx',
    ['prisma', 'db', 'push', '--accept-data-loss', '--url', databaseUrl],
    {
      stdio: 'inherit',
      shell: false,
    }
  );

  if (result.status !== 0) {
    throw new Error(`Prisma db push failed with exit code ${result.status}`);
  }

  console.log('✅ Database push completed');
} catch (error) {
  console.error('❌ Database push failed');
  process.exit(1);
}
