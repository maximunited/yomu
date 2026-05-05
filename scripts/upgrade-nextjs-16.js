#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Upgrading to Next.js 16...\n');

try {
  console.log('Step 1: Installing Next.js 16 and related packages...');
  execSync('npm install next@latest eslint-config-next@latest', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Next.js 16 installed!\n');
  console.log('Step 2: Running build to check for breaking changes...');

  try {
    execSync('npm run build', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ Build successful!\n');
  } catch (buildError) {
    console.log('\n❌ Build failed! Rolling back...\n');
    execSync('git restore package.json package-lock.json', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    execSync('npm install', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('❌ Rolled back to Next.js 15');
    process.exit(1);
  }

  console.log('Step 3: Running tests...');
  try {
    execSync('npm test -- --passWithNoTests', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ Tests passed!\n');
  } catch (testError) {
    console.log('\n⚠️  Some tests failed. Review carefully.\n');
  }

  console.log('Step 4: Checking for vulnerabilities...\n');
  try {
    execSync('npm audit', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ No vulnerabilities found!\n');
  } catch (auditError) {
    console.log('\n📊 Vulnerability check complete (see above)\n');
  }

  console.log('🎉 Next.js 16 upgrade complete!\n');
  console.log('Summary:');
  const version = execSync('npm list next --depth=0', {
    encoding: 'utf-8',
  });
  console.log(version);
} catch (error) {
  console.error('Error during upgrade:', error.message);
  process.exit(1);
}
