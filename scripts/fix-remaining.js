#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Fixing remaining non-breaking vulnerabilities...\n');

try {
  // Try to fix brace-expansion specifically
  console.log('Updating brace-expansion...');
  execSync('npm update brace-expansion', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Updates applied!\n');
  console.log('Checking remaining vulnerabilities...\n');

  execSync('npm audit', { encoding: 'utf-8', stdio: 'inherit' });
} catch (error) {
  // Audit will exit with error code if vulnerabilities exist
  console.log('\n📊 Remaining vulnerabilities shown above');
  console.log('\n⚠️  Breaking change fixes required for:');
  console.log('   - postcss (via Next.js)');
  console.log('   - uuid (via next-auth)');
  console.log('\n💡 Options:');
  console.log('   1. Wait for Next.js/next-auth updates (recommended)');
  console.log('   2. Use Dependabot to auto-update when patches available');
  console.log('   3. Run npm audit fix --force (may break functionality)\n');
}
