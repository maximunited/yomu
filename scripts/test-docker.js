/*
  Simple Docker compose test runner for CI/local.
  - Builds and starts the stack defined in compose.yml
  - Waits for the app to respond on http://localhost:3000
  - Tears down the stack
*/

/* eslint-disable no-console */
const { execSync } = require("child_process");
const http = require("http");
const https = require("https");
const { URL } = require("url");

function detectComposeCommand() {
  try {
    execSync("docker compose version", { stdio: "ignore" });
    return "docker compose";
  } catch (_) {
    execSync("docker-compose --version", { stdio: "ignore" });
    return "docker-compose";
  }
}

async function fetchStatus(url) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === "https:" ? https : http;
      const req = lib.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: "GET",
          timeout: 5000,
        },
        (res) => {
          const status = res.statusCode || 0;
          // Drain response to free socket
          res.resume();
          resolve(status);
        },
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy(new Error("Request timeout"));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function waitForHttp(url, timeoutMs = 120000, intervalMs = 2000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const status = await fetchStatus(url);
      if (status >= 200 && status < 500) {
        return true;
      }
      lastError = new Error(`HTTP ${status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw lastError || new Error("Timeout waiting for service");
}

(async () => {
  const compose = detectComposeCommand();
  const file = "-f compose.yml";
  const upCmd = `${compose} ${file} up -d --build`;
  const downCmd = `${compose} ${file} down -v`;
  console.log(`▶ Running: ${upCmd}`);
  try {
    execSync(upCmd, { stdio: "inherit" });
    const url = "http://localhost:3000";
    console.log(`⏳ Waiting for ${url} ...`);
    await waitForHttp(url);
    console.log("✅ Docker app responded successfully");
    process.exitCode = 0;
  } catch (err) {
    console.error(
      "❌ Docker test failed:",
      err && err.message ? err.message : err,
    );
    process.exitCode = 1;
  } finally {
    try {
      console.log(`▶ Tearing down: ${downCmd}`);
      execSync(downCmd, { stdio: "inherit" });
    } catch (teardownErr) {
      console.warn(
        "⚠️ Failed to teardown docker compose:",
        teardownErr && teardownErr.message ? teardownErr.message : teardownErr,
      );
    }
  }
})();
