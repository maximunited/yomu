#!/usr/bin/env node

/**
 * Quick CI Check Script
 * Fast local validation before pushing to GitHub
 * Run with: npm run ci:quick
 */

const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`🔧 ${description}...`, 'blue');
    execSync(command, { stdio: 'pipe' });
    log(`✅ ${description} passed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Quick CI Check', 'blue');
  log('─'.repeat(30), 'blue');

  const results = [
    runCommand('npm run lint', 'Linting'),
    runCommand('npm run format:check', 'Format Check'),
    runCommand('npm run build', 'Build'),
    runCommand('npm test', 'Unit Tests'),
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  log(
    `\n📊 Results: ${passed}/${total} checks passed`,
    passed === total ? 'green' : 'yellow'
  );

  if (passed === total) {
    log('🎉 Ready to push!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Fix issues before pushing', 'yellow');
    process.exit(1);
  }
}

main();
