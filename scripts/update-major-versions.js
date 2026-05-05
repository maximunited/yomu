#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Updating major versions of remaining packages...\n');

const packages = [
  '@commitlint/cli@latest',
  '@commitlint/config-conventional@latest',
  '@prisma/client@latest',
  'prisma@latest',
  '@types/node@latest',
  'lucide-react@latest',
  'typescript@latest',
];

console.log('Packages to update:');
packages.forEach((pkg) => console.log(`  - ${pkg}`));
console.log('');

try {
  console.log('Step 1: Installing latest versions...');
  execSync(`npm install ${packages.join(' ')}`, {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Packages installed!\n');

  console.log('Step 2: Regenerating Prisma client...');
  execSync('npx prisma generate', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Prisma client regenerated!\n');

  console.log('Step 3: Running build...');
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
    console.log('❌ Rolled back');
    process.exit(1);
  }

  console.log('Step 4: Running tests...');
  try {
    execSync('npm test -- --passWithNoTests', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ Tests passed!\n');
  } catch (testError) {
    console.log('\n⚠️  Some tests failed. Review carefully.\n');
  }

  console.log('Step 5: Checking vulnerabilities...\n');
  try {
    execSync('npm audit', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ No vulnerabilities!\n');
  } catch (auditError) {
    console.log('\n📊 Vulnerability check complete\n');
  }

  console.log('🎉 Major version updates complete!\n');
  console.log('Updated packages:');
  packages.forEach((pkg) => {
    const name = pkg.replace('@latest', '');
    try {
      const version = execSync(`npm list ${name} --depth=0`, {
        encoding: 'utf-8',
      });
      console.log(version.trim());
    } catch (e) {
      // Ignore errors
    }
  });
} catch (error) {
  console.error('Error during update:', error.message);
  process.exit(1);
}
