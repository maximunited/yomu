#!/usr/bin/env node

/**
 * Verify Node.js version meets project requirements
 * Usage: node scripts/verify-node-version.js
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function getCurrentNodeVersion() {
  return process.version.slice(1); // Remove 'v' prefix
}

function getRequiredNodeVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.engines?.node || '>=20.9.0';
  } catch (error) {
    log(`Error reading package.json: ${error.message}`, COLORS.red);
    process.exit(1);
  }
}

function getNvmrcVersion() {
  try {
    const nvmrcPath = path.join(__dirname, '..', '.nvmrc');
    if (!fs.existsSync(nvmrcPath)) {
      return null;
    }
    return fs.readFileSync(nvmrcPath, 'utf8').trim();
  } catch (error) {
    return null;
  }
}

function parseVersionRequirement(requirement) {
  // Simple parsing for >= requirements
  const match = requirement.match(/>=\s*(\d+\.\d+\.\d+)/);
  if (match) {
    return match[1];
  }
  return requirement;
}

function compareVersions(current, required) {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (currentParts[i] > requiredParts[i]) return 1;
    if (currentParts[i] < requiredParts[i]) return -1;
  }
  return 0;
}

function main() {
  log('\n🔍 Node.js Version Verification\n', COLORS.blue);

  const currentVersion = getCurrentNodeVersion();
  const requiredVersionSpec = getRequiredNodeVersion();
  const requiredVersion = parseVersionRequirement(requiredVersionSpec);
  const nvmrcVersion = getNvmrcVersion();

  log(`Current Node.js version: ${currentVersion}`, COLORS.blue);
  log(`Required version: ${requiredVersionSpec}`, COLORS.blue);
  if (nvmrcVersion) {
    log(`.nvmrc version: ${nvmrcVersion}`, COLORS.blue);
  }
  log(''); // Empty line

  const comparison = compareVersions(currentVersion, requiredVersion);

  if (comparison >= 0) {
    log('✅ Node.js version meets requirements', COLORS.green);

    if (nvmrcVersion && currentVersion !== nvmrcVersion) {
      log(
        `⚠️  Note: Current version (${currentVersion}) differs from .nvmrc (${nvmrcVersion})`,
        COLORS.yellow
      );
      log(
        '   This is OK as long as it meets minimum requirements',
        COLORS.yellow
      );
    }

    process.exit(0);
  } else {
    log(`❌ Node.js version too old!`, COLORS.red);
    log(`   Current: ${currentVersion}`, COLORS.red);
    log(`   Required: ${requiredVersionSpec}`, COLORS.red);
    log('', COLORS.reset);
    log('Please upgrade Node.js:', COLORS.yellow);
    log('  - Using nvm: nvm install 20.9.0 && nvm use 20.9.0', COLORS.yellow);
    log('  - Using fnm: fnm install 20.9.0 && fnm use 20.9.0', COLORS.yellow);
    log('  - Or download from: https://nodejs.org', COLORS.yellow);
    process.exit(1);
  }
}

main();
