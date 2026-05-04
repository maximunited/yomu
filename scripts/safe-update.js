#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Performing safe updates (within semver range)...\n');

try {
  execSync('npm update', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Safe updates completed!\n');
  console.log('Running tests to verify nothing broke...\n');

  try {
    execSync('npm test -- --passWithNoTests', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ Tests passed!\n');
  } catch (testError) {
    console.log('\n⚠️  Some tests failed. Review changes carefully.\n');
  }

  console.log('Checking for remaining vulnerabilities...\n');
  try {
    execSync('npm audit', { encoding: 'utf-8', stdio: 'inherit' });
  } catch (auditError) {
    console.log('\n⚠️  Some vulnerabilities remain (see above)\n');
  }
} catch (error) {
  console.error('Error during update:', error.message);
  process.exit(1);
}
