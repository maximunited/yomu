#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking for package updates...\n');

const packages = ['next', 'next-auth', 'postcss', 'uuid'];

packages.forEach((pkg) => {
  try {
    const output = execSync(`npm view ${pkg} version`, {
      encoding: 'utf-8',
    }).trim();
    const current =
      execSync(`npm list ${pkg} --depth=0 2>&1 | grep ${pkg}`, {
        encoding: 'utf-8',
      })
        .trim()
        .match(/@([\d.]+)/)?.[1] || 'not found';

    console.log(`${pkg}:`);
    console.log(`  Current: ${current}`);
    console.log(`  Latest:  ${output}`);
    console.log('');
  } catch (error) {
    console.log(`${pkg}: Error checking version`);
  }
});

console.log('💡 To update to latest versions:');
console.log('   npm install next@latest next-auth@latest\n');
