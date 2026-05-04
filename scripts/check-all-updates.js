#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking for all available updates...\n');

try {
  // Check for outdated packages
  const output = execSync('npm outdated --json', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const outdated = JSON.parse(output || '{}');

  if (Object.keys(outdated).length === 0) {
    console.log('✅ All packages are up to date!\n');
    process.exit(0);
  }

  console.log('📦 Outdated Packages:\n');
  console.log(
    'Package                          Current    Wanted     Latest     Type'
  );
  console.log(
    '-------------------------------- ---------- ---------- ---------- --------'
  );

  Object.entries(outdated).forEach(([name, info]) => {
    const nameCol = name.padEnd(32);
    const currentCol = (info.current || 'N/A').padEnd(10);
    const wantedCol = (info.wanted || 'N/A').padEnd(10);
    const latestCol = (info.latest || 'N/A').padEnd(10);
    const type = info.type === 'devDependencies' ? 'dev' : 'prod';

    console.log(
      `${nameCol} ${currentCol} ${wantedCol} ${latestCol} ${type}`
    );
  });

  console.log('\n💡 Update Commands:\n');
  console.log('Safe updates (within semver range):');
  console.log('  npm update\n');
  console.log('Update to latest (may have breaking changes):');
  console.log('  npm update --latest\n');
  console.log('Update specific package:');
  console.log('  npm install package@latest\n');
} catch (error) {
  if (error.stdout) {
    // npm outdated exits with code 1 if there are outdated packages
    try {
      const outdated = JSON.parse(error.stdout.toString() || '{}');

      if (Object.keys(outdated).length === 0) {
        console.log('✅ All packages are up to date!\n');
        process.exit(0);
      }

      console.log('📦 Outdated Packages:\n');
      console.log(
        'Package                          Current    Wanted     Latest     Type'
      );
      console.log(
        '-------------------------------- ---------- ---------- ---------- --------'
      );

      Object.entries(outdated).forEach(([name, info]) => {
        const nameCol = name.padEnd(32);
        const currentCol = (info.current || 'N/A').padEnd(10);
        const wantedCol = (info.wanted || 'N/A').padEnd(10);
        const latestCol = (info.latest || 'N/A').padEnd(10);
        const type = info.type === 'devDependencies' ? 'dev' : 'prod';

        console.log(
          `${nameCol} ${currentCol} ${wantedCol} ${latestCol} ${type}`
        );
      });

      console.log('\n💡 Update Commands:\n');
      console.log('Safe updates (within semver range):');
      console.log('  npm update\n');
      console.log('Update to latest (may have breaking changes):');
      console.log('  npm update --latest\n');
    } catch (parseError) {
      console.log('✅ All packages are up to date!\n');
    }
  } else {
    console.error('Error checking updates:', error.message);
    process.exit(1);
  }
}
