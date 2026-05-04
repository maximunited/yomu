#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Attempting to fix vulnerabilities...\n');

try {
  console.log('Step 1: Running npm audit fix (non-breaking changes only)...');
  const output = execSync('npm audit fix', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Non-breaking fixes applied!\n');
  console.log('Running audit again to check remaining vulnerabilities...');

  try {
    execSync('npm audit', { encoding: 'utf-8', stdio: 'inherit' });
    console.log('\n✅ All vulnerabilities fixed!');
  } catch (error) {
    console.log('\n⚠️  Some vulnerabilities remain.');
    console.log(
      '\n💡 To fix remaining vulnerabilities that require breaking changes:'
    );
    console.log('   npm audit fix --force');
    console.log(
      '\n⚠️  WARNING: --force may introduce breaking changes. Review carefully!\n'
    );
  }
} catch (error) {
  console.error('Error running npm audit fix:', error.message);
  process.exit(1);
}
