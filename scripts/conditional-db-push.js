#!/usr/bin/env node
/**
 * Conditionally run Prisma DB push
 * Skips if SKIP_DB_PUSH environment variable is set
 */

const { spawnSync } = require('child_process');

if (process.env.SKIP_DB_PUSH) {
  console.log('⏭️  Skipping database push (SKIP_DB_PUSH is set)');
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
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
