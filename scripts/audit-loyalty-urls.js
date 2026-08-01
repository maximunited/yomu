/**
 * Monthly loyalty URL audit
 * --------------------------------------
 * HEAD-checks brand websites / benefit URLs from seed.js (or a JSON export).
 * Flags HTTP failures and (optionally) stale Last checked dates from JSON.
 *
 * Usage:
 *   node scripts/audit-loyalty-urls.js
 *   node scripts/audit-loyalty-urls.js --json=path/to/export.json
 *   node scripts/audit-loyalty-urls.js --stale-days=60
 *   npm run audit:loyalty-urls
 *
 * JSON export shape (optional):
 *   {
 *     "brands": [{ "name": "...", "website": "https://...", "lastChecked": "2026-08-01" }],
 *     "benefits": [{ "title": "...", "brand": "...", "url": "https://...", "lastChecked": "2026-08-01" }]
 *   }
 *
 * Notion update: not performed by this script (no Notion token in-repo).
 * After reviewing the report, update Last checked in YomU Brands / YomU Benefits via Notion UI or MCP.
 *
 * Exit codes:
 *   0 — all checked URLs OK
 *   1 — one or more URL failures (or invalid input)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const DEFAULT_STALE_DAYS = 60;
const REQUEST_TIMEOUT_MS = 12000;
const USER_AGENT =
  'YomU-LoyaltyUrlAudit/1.0 (+https://github.com/MaximUnited/yomu)';

function parseArgs(argv) {
  const out = { json: null, staleDays: DEFAULT_STALE_DAYS };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--json=')) out.json = arg.slice('--json='.length);
    else if (arg.startsWith('--stale-days=')) {
      const n = Number(arg.slice('--stale-days='.length));
      if (!Number.isFinite(n) || n < 1) {
        console.error('Invalid --stale-days value');
        process.exit(1);
      }
      out.staleDays = n;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        `Usage: node scripts/audit-loyalty-urls.js [--json=file] [--stale-days=${DEFAULT_STALE_DAYS}]`
      );
      process.exit(0);
    }
  }
  return out;
}

function loadFromSeed() {
  // Require seed module pieces by evaluating the brands array via regex-safe parse:
  // seed.js is not a pure data module; extract website URLs with a light parse.
  const seedPath = path.join(__dirname, 'seed.js');
  const src = fs.readFileSync(seedPath, 'utf8');

  const brands = [];
  const brandBlockMatch = src.match(/const predefinedBrands = \[([\s\S]*?)\];/);
  if (!brandBlockMatch) {
    throw new Error('Could not find predefinedBrands in scripts/seed.js');
  }

  // Split on object starts: { name:
  const objectChunks = brandBlockMatch[1].split(/\n\s*\{/).slice(1);
  for (const chunk of objectChunks) {
    const name = chunk.match(/name:\s*(['"`])([\s\S]*?)\1/)?.[2];
    const website = chunk.match(/website:\s*(['"`])([\s\S]*?)\1/)?.[2];
    if (name && website) {
      brands.push({ name, website, lastChecked: null });
    }
  }

  const benefits = [];
  // Benefit urls from sampleBenefits title/url pairs
  const benefitBlocks = src.split(/\n\s*\{\s*\n\s*brandId:/).slice(1);
  for (const block of benefitBlocks) {
    const title = block.match(/title:\s*(['"`])([\s\S]*?)\1/)?.[2];
    const url = block.match(/\burl:\s*(['"`])([\s\S]*?)\1/)?.[2];
    if (title && url) {
      benefits.push({ title, brand: null, url, lastChecked: null });
    }
  }

  return { brands, benefits, source: 'scripts/seed.js' };
}

function loadFromJson(filePath) {
  const abs = path.resolve(filePath);
  const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const brands = (data.brands || []).map((b) => ({
    name: b.name || b.Name,
    website: b.website || b['Website URL'] || b.Website,
    lastChecked: b.lastChecked || b['Last checked'] || null,
  }));
  const benefits = (data.benefits || []).map((b) => ({
    title: b.title || b.Title,
    brand: b.brand || b.Brand || null,
    url: b.url || b['Benefit URL'],
    lastChecked: b.lastChecked || b['Last checked'] || null,
  }));
  return { brands, benefits, source: abs };
}

function headCheck(url) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve({ url, ok: false, status: null, error: 'invalid URL' });
      return;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      resolve({ url, ok: false, status: null, error: 'unsupported protocol' });
      return;
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method: 'HEAD',
        timeout: REQUEST_TIMEOUT_MS,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
      },
      (res) => {
        // Some hosts reject HEAD — retry GET on 405/403/501
        if ([403, 405, 501].includes(res.statusCode)) {
          res.resume();
          getFallback(url).then(resolve);
          return;
        }
        const status = res.statusCode || 0;
        res.resume();
        resolve(classifyStatus(url, status, null));
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: 'timeout',
      });
    });
    req.on('error', (err) => {
      // HEAD unsupported on some stacks — try GET
      if (err.code === 'ECONNRESET' || err.code === 'EPROTO') {
        getFallback(url).then(resolve);
        return;
      }
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: err.message,
      });
    });
    req.end();
  });
}

/** 2xx/3xx = ok; 429 / common bot 403 = blocked (warn); else fail */
function classifyStatus(url, status, method) {
  const blocked = status === 429 || status === 403;
  const ok = status >= 200 && status < 400;
  return {
    url,
    ok,
    blocked,
    status,
    error: null,
    ...(method ? { method } : {}),
  };
}

function getFallback(url) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve({ url, ok: false, status: null, error: 'invalid URL' });
      return;
    }
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method: 'GET',
        timeout: REQUEST_TIMEOUT_MS,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
      },
      (res) => {
        const status = res.statusCode || 0;
        res.resume();
        resolve(classifyStatus(url, status, 'GET'));
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: 'timeout',
        method: 'GET',
      });
    });
    req.on('error', (err) => {
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: err.message,
        method: 'GET',
      });
    });
    req.end();
  });
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  const t = Date.parse(String(isoDate).slice(0, 10));
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

function mdEscape(s) {
  // Escape backslashes first so pipe escaping is not undone
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|');
}

async function main() {
  const args = parseArgs(process.argv);
  const loaded = args.json ? loadFromJson(args.json) : loadFromSeed();

  const urlJobs = [];
  for (const b of loaded.brands) {
    if (b.website) {
      urlJobs.push({
        kind: 'brand',
        label: b.name,
        url: b.website,
        lastChecked: b.lastChecked,
      });
    }
  }
  for (const b of loaded.benefits) {
    if (b.url) {
      urlJobs.push({
        kind: 'benefit',
        label: b.brand ? `${b.brand} — ${b.title}` : b.title,
        url: b.url,
        lastChecked: b.lastChecked,
      });
    }
  }

  // Deduplicate by URL (keep first label)
  const seen = new Map();
  for (const job of urlJobs) {
    if (!seen.has(job.url)) seen.set(job.url, job);
  }
  const unique = [...seen.values()];

  console.log(`# YomU loyalty URL audit`);
  console.log('');
  console.log(`- Source: \`${loaded.source}\``);
  console.log(`- Checked: ${unique.length} unique URLs`);
  console.log(`- Stale threshold: ${args.staleDays} days`);
  console.log(`- When: ${new Date().toISOString()}`);
  console.log('');

  const results = [];
  // modest concurrency
  const concurrency = 8;
  let i = 0;
  async function worker() {
    while (i < unique.length) {
      const idx = i++;
      const job = unique[idx];
      const check = await headCheck(job.url);
      results[idx] = { ...job, ...check };
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const blocked = results.filter((r) => r.blocked);
  const failures = results.filter((r) => !r.ok && !r.blocked);
  const stale = results.filter((r) => {
    const d = daysSince(r.lastChecked);
    return d !== null && d > args.staleDays;
  });
  const unchecked = results.filter((r) => !r.lastChecked);

  console.log('## Results');
  console.log('');
  console.log('| Kind | Label | URL | Status | OK | Last checked |');
  console.log('| ---- | ----- | --- | ------ | -- | ------------ |');
  for (const r of results) {
    const okLabel = r.ok ? 'yes' : r.blocked ? 'blocked' : 'no';
    console.log(
      `| ${r.kind} | ${mdEscape(r.label)} | ${mdEscape(r.url)} | ${r.status ?? r.error ?? ''} | ${okLabel} | ${r.lastChecked ?? '—'} |`
    );
  }

  console.log('');
  console.log('## Summary');
  console.log('');
  console.log(`- Hard failures: **${failures.length}**`);
  console.log(`- Bot-blocked (403/429): **${blocked.length}** (warn only)`);
  console.log(
    `- Stale Last checked (>${args.staleDays}d): **${stale.length}**`
  );
  console.log(`- Missing Last checked: **${unchecked.length}**`);
  console.log('');

  if (failures.length) {
    console.log('## Failures');
    console.log('');
    for (const f of failures) {
      console.log(
        `- [${f.kind}] ${f.label}: ${f.url} (${f.status ?? f.error})`
      );
    }
    console.log('');
  }

  if (blocked.length) {
    console.log('## Bot-blocked (manual verify in browser)');
    console.log('');
    for (const b of blocked) {
      console.log(`- [${b.kind}] ${b.label}: ${b.url} (${b.status})`);
    }
    console.log('');
  }

  if (stale.length) {
    console.log('## Stale Last checked');
    console.log('');
    for (const s of stale) {
      console.log(
        `- [${s.kind}] ${s.label}: last checked ${s.lastChecked} (${daysSince(s.lastChecked)}d ago)`
      );
    }
    console.log('');
  }

  console.log(
    'Notion: update `Last checked` on YomU Brands / YomU Benefits after verifying URLs (MCP or UI).'
  );

  // Exit non-zero on hard failures or stale lastChecked when provided in JSON
  if (failures.length || stale.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
