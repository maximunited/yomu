/**
 * Seasonal / stale verified-benefit refresh report
 * --------------------------------------
 * Queue researched benefits for re-verification.
 *
 * Modes:
 *   (default) seed — prints seasonal review queue for non-soft brands in seed.js
 *   --db          — reports Benefit rows where verified=true and lastChecked
 *                   is missing or older than --stale-days (default 180)
 *
 * Usage:
 *   node scripts/report-stale-verified.js
 *   node scripts/report-stale-verified.js --db --stale-days=180
 *   node scripts/report-stale-verified.js --db --fail-on-stale
 *   npm run catalog:stale
 *
 * Exit codes:
 *   0 — report printed (seed mode always 0; db mode 0 unless --fail-on-stale)
 *   1 — --fail-on-stale and stale rows found, or invalid input / DB error
 *
 * Does not mutate the database. No Notion token required.
 */

const {
  parseSeedCatalog,
  analyzeStaleVerified,
} = require('./lib/parse-seed-catalog');

const DEFAULT_STALE_DAYS = 180;

function parseArgs(argv) {
  const out = {
    db: false,
    staleDays: DEFAULT_STALE_DAYS,
    failOnStale: false,
    json: false,
  };
  for (const arg of argv.slice(2)) {
    if (arg === '--db') out.db = true;
    else if (arg === '--fail-on-stale') out.failOnStale = true;
    else if (arg === '--json') out.json = true;
    else if (arg.startsWith('--stale-days=')) {
      const n = Number(arg.slice('--stale-days='.length));
      if (!Number.isFinite(n) || n < 1) {
        console.error('Invalid --stale-days value');
        process.exit(1);
      }
      out.staleDays = n;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        `Usage: node scripts/report-stale-verified.js [--db] [--stale-days=${DEFAULT_STALE_DAYS}] [--fail-on-stale] [--json]`
      );
      process.exit(0);
    }
  }
  return out;
}

async function loadDbBenefits() {
  const { createPrismaClient, disconnectPrisma } = require('./prisma-client');
  const prisma = createPrismaClient();
  try {
    const benefits = await prisma.benefit.findMany({
      select: {
        title: true,
        verified: true,
        lastChecked: true,
        brand: { select: { name: true } },
      },
      orderBy: { lastChecked: 'asc' },
    });
    return benefits.map((b) => ({
      brandName: b.brand.name,
      title: b.title,
      verified: b.verified,
      lastChecked: b.lastChecked,
    }));
  } finally {
    await disconnectPrisma();
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const catalog = parseSeedCatalog();

  let report;
  if (args.db) {
    const benefits = await loadDbBenefits();
    report = analyzeStaleVerified({
      mode: 'db',
      benefits,
      staleDays: args.staleDays,
    });
  } else {
    report = analyzeStaleVerified({
      mode: 'seed',
      softBrandNames: catalog.softBrandNames,
      benefits: catalog.benefits,
      staleDays: args.staleDays,
    });
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('# YomU stale / seasonal verified refresh');
    console.log('');
    console.log(`- Mode: ${report.mode}`);
    console.log(`- Stale threshold: ${report.staleDays} days`);
    console.log(`- Queue size: ${report.stale.length}`);
    if (report.mode === 'db') {
      console.log(`- Still fresh: ${report.ok.length}`);
    }
    console.log(`- When: ${new Date().toISOString()}`);
    console.log('');

    if (report.mode === 'seed') {
      console.log(
        'Seed mode lists researched (non-soft) benefits as a seasonal review queue.'
      );
      console.log(
        'Run with `--db` against Postgres to flag verified rows with old/missing lastChecked.'
      );
      console.log('');
    }

    if (report.stale.length) {
      console.log('## Queue');
      console.log('');
      console.log('| Brand | Title | Last checked | Days | Reason |');
      console.log('| ----- | ----- | ------------ | ---- | ------ |');
      for (const row of report.stale) {
        console.log(
          `| ${esc(row.brandName)} | ${esc(row.title)} | ${row.lastChecked ?? '—'} | ${row.daysSince ?? '—'} | ${row.reason} |`
        );
      }
      console.log('');
    } else {
      console.log('No items in queue.');
    }
  }

  if (args.failOnStale && report.mode === 'db' && report.stale.length) {
    process.exit(1);
  }
}

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
