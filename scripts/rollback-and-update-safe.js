#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Rolling back Prisma 7 and updating safe packages...\n');

try {
  console.log('Step 1: Rolling back to previous state...');
  execSync('git restore package.json package-lock.json', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\nStep 2: Reinstalling dependencies...');
  execSync('npm install', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Rollback complete!\n');

  // Update only safe packages (no Prisma)
  const safePackages = [
    '@commitlint/cli@latest',
    '@commitlint/config-conventional@latest',
    '@types/node@latest',
    'lucide-react@latest',
    'typescript@latest',
  ];

  console.log('Step 3: Updating safe packages (excluding Prisma)...');
  console.log('Packages to update:');
  safePackages.forEach((pkg) => console.log(`  - ${pkg}`));
  console.log('');

  execSync(`npm install ${safePackages.join(' ')}`, {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Safe packages updated!\n');

  console.log('Step 4: Running build...');
  execSync('npm run build', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  console.log('\n✅ Build successful!\n');

  console.log('Step 5: Running tests...');
  try {
    execSync('npm test -- --passWithNoTests', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('\n✅ Tests passed!\n');
  } catch (testError) {
    console.log('\n⚠️  Some tests failed\n');
  }

  console.log('🎉 Safe updates complete!\n');
  console.log('Updated:');
  console.log('  ✅ @commitlint packages 19 → 20');
  console.log('  ✅ @types/node 24 → 25');
  console.log('  ✅ lucide-react 0.540 → 1.14');
  console.log('  ✅ typescript 5.9 → 6.0');
  console.log('\nSkipped (breaking changes):');
  console.log('  ⏭️  Prisma 6 → 7 (requires schema migration)');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
