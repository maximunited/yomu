#!/usr/bin/env node
/**
 * Conditionally run Prisma DB push
 * Skips if SKIP_DB_PUSH environment variable is set
 */

const { execSync } = require('child_process');

if (process.env.SKIP_DB_PUSH) {
  console.log('⏭️  Skipping database push (SKIP_DB_PUSH is set)');
  process.exit(0);
}

try {
  console.log('📦 Pushing Prisma schema to database...');
  const databaseUrl =
    process.env.DATABASE_URL || 'postgresql://localhost:5432/yomu';
  execSync(`prisma db push --accept-data-loss --url="${databaseUrl}"`, {
    stdio: 'inherit',
  });
  console.log('✅ Database push completed');
} catch (error) {
  console.error('❌ Database push failed');
  process.exit(1);
}
