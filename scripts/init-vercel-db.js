// Script to initialize Vercel Postgres database schema
// Run with: node scripts/init-vercel-db.js

const { execSync } = require('child_process');

console.log('🔄 Initializing Vercel Postgres database...');

try {
  // Run prisma db push with the DATABASE_URL from .env.local
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env },
  });

  console.log('✅ Database schema initialized successfully!');
  console.log('\n📝 Next step: Run seeding if needed');
  console.log('   node scripts/seed.js');
} catch (error) {
  console.error('❌ Failed to initialize database:', error.message);
  process.exit(1);
}
