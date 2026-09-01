/**
 * Seed catalog drift / integrity check
 * --------------------------------------
 * Seed.js is the source of truth. This script:
 *   1. Structural checks (always) — missing fields, orphan benefits, soft-list drift
 *   2. Optional --db — compare seed brand/benefit names to live Postgres (read-only)
 *
 * Usage:
 *   node scripts/check-catalog-drift.js
 *   node scripts/check-catalog-drift.js --db
 *   npm run catalog:drift
 *
 * Exit codes:
 *   0 — no structural (or DB) errors
 *   1 — errors found
 *
 * CI: blocking (deterministic, no network, no Notion token).
 * DB mode is for local/ops only — not required in CI.
 */

const {
  parseSeedCatalog,
  enrichCatalogBenefits,
  analyzeCatalogStructure,
  analyzeSeedDbDrift,
} = require('./lib/parse-seed-catalog');

function parseArgs(argv) {
  const out = { db: false, json: false };
  for (const arg of argv.slice(2)) {
    if (arg === '--db') out.db = true;
    else if (arg === '--json') out.json = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/check-catalog-drift.js [--db] [--json]');
      process.exit(0);
    }
  }
  return out;
}

async function loadDbCatalog() {
  const { createPrismaClient, disconnectPrisma } = require('./prisma-client');
  const prisma = createPrismaClient();
  try {
    const brands = await prisma.brand.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    const benefits = await prisma.benefit.findMany({
      select: {
        title: true,
        termsUrl: true,
        verified: true,
        lastChecked: true,
        brand: { select: { name: true } },
      },
    });
    return {
      brands,
      benefits: benefits.map((b) => ({
        brandName: b.brand.name,
        title: b.title,
        termsUrl: b.termsUrl,
        verified: b.verified,
        lastChecked: b.lastChecked,
      })),
    };
  } finally {
    await disconnectPrisma();
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const catalog = parseSeedCatalog();
  const structural = analyzeCatalogStructure(catalog);

  let dbDrift = null;
  if (args.db) {
    const db = await loadDbCatalog();
    dbDrift = analyzeSeedDbDrift(
      {
        brands: catalog.brands,
        benefits: enrichCatalogBenefits(catalog),
      },
      db
    );
  }

  const errors = [...structural.errors, ...(dbDrift ? dbDrift.errors : [])];
  const warnings = [
    ...structural.warnings,
    ...(dbDrift ? dbDrift.warnings : []),
  ];

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          source: catalog.source,
          brands: catalog.brands.length,
          benefits: catalog.benefits.length,
          softBrands: catalog.softBrandNames.length,
          errors,
          warnings,
          db: Boolean(args.db),
        },
        null,
        2
      )
    );
  } else {
    console.log('# YomU catalog drift check');
    console.log('');
    console.log(`- Source: \`${catalog.source}\``);
    console.log(`- Brands: ${catalog.brands.length}`);
    console.log(`- Benefits: ${catalog.benefits.length}`);
    console.log(`- Soft brands: ${catalog.softBrandNames.length}`);
    console.log(`- DB compare: ${args.db ? 'yes' : 'no'}`);
    console.log(`- When: ${new Date().toISOString()}`);
    console.log('');
    console.log('## Summary');
    console.log('');
    console.log(`- Errors: **${errors.length}**`);
    console.log(`- Warnings: **${warnings.length}**`);
    console.log('');

    if (errors.length) {
      console.log('## Errors');
      console.log('');
      for (const e of errors) console.log(`- ${e}`);
      console.log('');
    }
    if (warnings.length) {
      console.log('## Warnings');
      console.log('');
      for (const w of warnings) console.log(`- ${w}`);
      console.log('');
    }

    if (!errors.length) {
      console.log('OK — seed catalog structure looks consistent.');
    }
  }

  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
