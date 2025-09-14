#!/usr/bin/env node

/**
 * Local CI Testing Script
 * Simulates GitHub Actions CI environment locally
 * Run with: npm run ci:all or node scripts/test-ci-local.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n🔧 ${step}: ${description}`, 'cyan');
  log('─'.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function runCommand(command, description, options = {}) {
  try {
    log(`Running: ${command}`, 'blue');
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options,
    });
    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    if (!options.continueOnError) {
      process.exit(1);
    }
    return false;
  }
}

function checkEnvironment() {
  logStep('Environment Check', 'Verifying local environment');

  // Check Node.js version
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`);

  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    logError(
      'package.json not found. Please run this script from the project root.'
    );
    process.exit(1);
  }

  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    logWarning('node_modules not found. Run "npm install" first.');
    process.exit(1);
  }

  logSuccess('Environment check passed');
}

function simulateCISetup() {
  logStep('CI Setup', 'Simulating GitHub Actions environment');

  // Set CI environment variables
  process.env.CI = 'true';
  process.env.NODE_ENV = 'test';
  process.env.NEXT_TELEMETRY_DISABLED = '1';

  log('Set CI environment variables');
  logSuccess('CI environment setup complete');
}

function runLinting() {
  logStep('Linting', 'Running ESLint checks');
  return runCommand('npm run lint', 'ESLint check');
}

function runBuild() {
  logStep('Build', 'Building Next.js application');
  return runCommand('npm run build', 'Next.js build');
}

function runUnitTests() {
  logStep('Unit Tests', 'Running Jest tests with coverage');
  return runCommand('npm run test:coverage', 'Unit tests with coverage');
}

function runTranslationTests() {
  logStep('Translation Tests', 'Running translation checks');
  return runCommand('npm run test:translations', 'Translation tests');
}

function runDockerTests() {
  logStep('Docker Tests', 'Running Docker build and smoke tests');
  return runCommand('npm run test:docker', 'Docker tests', {
    continueOnError: true,
  });
}

function runSecurityAudit() {
  logStep('Security Audit', 'Running npm audit');
  return runCommand(
    'npm audit --omit=dev --audit-level=moderate',
    'Security audit',
    { continueOnError: true }
  );
}

function runFormatCheck() {
  logStep('Format Check', 'Checking code formatting');
  return runCommand('npm run format:check', 'Format check');
}

function runCoverageUpload() {
  logStep('Coverage Upload', 'Simulating coverage upload (skipped locally)');
  logWarning('Coverage upload skipped in local environment');
  return true;
}

function generateReport(results) {
  logStep('CI Report', 'Generating test results report');

  const totalSteps = Object.keys(results).length;
  const passedSteps = Object.values(results).filter(Boolean).length;
  const failedSteps = totalSteps - passedSteps;

  log(`\n📊 CI Test Results:`, 'bright');
  log('═'.repeat(40), 'bright');
  log(`Total Steps: ${totalSteps}`, 'blue');
  log(`Passed: ${passedSteps}`, 'green');
  log(`Failed: ${failedSteps}`, failedSteps > 0 ? 'red' : 'green');
  log(
    `Success Rate: ${Math.round((passedSteps / totalSteps) * 100)}%`,
    passedSteps === totalSteps ? 'green' : 'yellow'
  );

  log('\n📋 Step Details:', 'bright');
  Object.entries(results).forEach(([step, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`  ${status} ${step}`, color);
  });

  if (failedSteps > 0) {
    log('\n💡 Recommendations:', 'yellow');
    log('  - Fix failing steps before pushing to GitHub', 'yellow');
    log('  - Run individual steps to debug specific issues', 'yellow');
    log('  - Check the logs above for detailed error messages', 'yellow');
  } else {
    log('\n🎉 All CI checks passed! Ready for GitHub Actions.', 'green');
  }
}

async function main() {
  const startTime = Date.now();

  log('🚀 Starting Local CI Testing', 'bright');
  log('═'.repeat(50), 'bright');

  // Check environment
  checkEnvironment();

  // Simulate CI setup
  simulateCISetup();

  // Run all CI steps
  const results = {
    Linting: runLinting(),
    Build: runBuild(),
    'Unit Tests': runUnitTests(),
    'Translation Tests': runTranslationTests(),
    'Docker Tests': runDockerTests(),
    'Security Audit': runSecurityAudit(),
    'Format Check': runFormatCheck(),
    'Coverage Upload': runCoverageUpload(),
  };

  // Generate report
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  generateReport(results);

  log(`\n⏱️  Total Duration: ${duration}s`, 'blue');

  // Exit with appropriate code
  const hasFailures = Object.values(results).some((result) => !result);
  process.exit(hasFailures ? 1 : 0);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logError(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
});
