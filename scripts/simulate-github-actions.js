#!/usr/bin/env node

/**
 * GitHub Actions Simulation Script
 * Simulates the exact steps from .github/workflows/ci.yml
 * Run with: npm run ci:simulate
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n🔧 ${step}`, 'cyan');
  log(`   ${description}`, 'blue');
  log('─'.repeat(50), 'cyan');
}

function runCommand(command, description, options = {}) {
  try {
    log(`Running: ${command}`, 'blue');
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, ...options.env },
    });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    if (!options.continueOnError) {
      process.exit(1);
    }
    return false;
  }
}

function simulateGitHubActions() {
  log('🚀 Simulating GitHub Actions CI Workflow', 'bright');
  log('═'.repeat(60), 'bright');

  // Step 1: Checkout (already done locally)
  logStep('Checkout', 'Code is already checked out locally');
  log('✅ Checkout completed', 'green');

  // Step 2: Setup Node.js
  logStep('Setup Node.js', 'Using local Node.js installation');
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`, 'blue');
  log('✅ Node.js setup completed', 'green');

  // Step 3: Install dependencies
  logStep('Install Dependencies', 'Installing with npm ci');
  runCommand('npm ci', 'Dependency installation');

  // Step 4: Lint (non-blocking)
  logStep('Lint', 'Running ESLint (non-blocking)');
  runCommand(
    'npm run lint || echo "Lint had warnings/errors (non-blocking)"',
    'ESLint check',
    { continueOnError: true }
  );

  // Step 5: Type-check and build
  logStep('Type-check and Build', 'Building Next.js application');
  runCommand('npm run build', 'Next.js build', {
    env: { NEXT_TELEMETRY_DISABLED: '1' },
  });

  // Step 6: Run Jest tests (with coverage)
  logStep('Run Jest Tests', 'Running tests with coverage');
  runCommand('npm run test:coverage', 'Jest tests with coverage', {
    env: { CI: 'true' },
  });

  // Step 7: Run translation checks
  logStep('Translation Checks', 'Running translation validation');
  runCommand('npm run test:translations', 'Translation checks');

  // Step 8: Upload coverage (simulated)
  logStep('Upload Coverage', 'Simulating coverage upload to Coveralls');
  log('⚠️  Coverage upload simulated (skipped locally)', 'yellow');

  log('\n🎉 GitHub Actions CI simulation completed successfully!', 'green');
  log(
    'All steps that would run on GitHub Actions have been validated locally.',
    'green'
  );
}

// Run the simulation
simulateGitHubActions();
