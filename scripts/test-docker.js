/*
  Simple Docker compose test runner for CI/local.
  - Builds and starts the stack defined in compose.yml
  - Waits for the app to respond on http://localhost:3000
  - Tears down the stack
*/

/* eslint-disable no-console */
const { execSync } = require('child_process');
const fetch = require('node-fetch');

function detectComposeCommand() {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return 'docker compose';
  } catch (_) {
    execSync('docker-compose --version', { stdio: 'ignore' });
    return 'docker-compose';
  }
}

async function waitForHttp(url, timeoutMs = 120000, intervalMs = 2000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status >= 200 && res.status < 500) {
        return true;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw lastError || new Error('Timeout waiting for service');
}

(async () => {
  const compose = detectComposeCommand();
  const file = '-f compose.yml';
  const upCmd = `${compose} ${file} up -d --build`;
  const downCmd = `${compose} ${file} down -v`;
  console.log(`▶ Running: ${upCmd}`);
  try {
    execSync(upCmd, { stdio: 'inherit' });
    const url = 'http://localhost:3000';
    console.log(`⏳ Waiting for ${url} ...`);
    await waitForHttp(url);
    console.log('✅ Docker app responded successfully');
    process.exitCode = 0;
  } catch (err) {
    console.error('❌ Docker test failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    try {
      console.log(`▶ Tearing down: ${downCmd}`);
      execSync(downCmd, { stdio: 'inherit' });
    } catch (teardownErr) {
      console.warn('⚠️ Failed to teardown docker compose:', teardownErr && teardownErr.message ? teardownErr.message : teardownErr);
    }
  }
})();


