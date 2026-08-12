/**
 * Shared seed.js catalog parser (no DB, no Notion).
 * Source of truth for catalog ops: drift, URL audit, stale-verified queues.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_SEED_PATH = path.join(__dirname, '..', 'seed.js');

function readSeedSource(seedPath = DEFAULT_SEED_PATH) {
  return fs.readFileSync(seedPath, 'utf8');
}

function parseSoftBrandNames(src) {
  const match = src.match(
    /const SOFT_BRAND_NAMES = new Set\(\[([\s\S]*?)\]\);/
  );
  if (!match) return [];
  const names = [];
  const re = /(['"`])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    names.push(m[2]);
  }
  return names;
}

function parseBrands(src) {
  const brandBlockMatch = src.match(/const predefinedBrands = \[([\s\S]*?)\];/);
  if (!brandBlockMatch) {
    throw new Error('Could not find predefinedBrands in scripts/seed.js');
  }

  const brands = [];
  const objectChunks = brandBlockMatch[1].split(/\n\s*\{/).slice(1);
  for (const chunk of objectChunks) {
    const name = chunk.match(/name:\s*(['"`])([\s\S]*?)\1/)?.[2];
    const website = chunk.match(/website:\s*(['"`])([\s\S]*?)\1/)?.[2];
    const actionUrl = chunk.match(/actionUrl:\s*(['"`])([\s\S]*?)\1/)?.[2];
    const category = chunk.match(/category:\s*(['"`])([\s\S]*?)\1/)?.[2];
    if (!name) continue;
    brands.push({
      name,
      website: website || null,
      actionUrl: actionUrl || null,
      category: category || null,
    });
  }
  return brands;
}

function parseBenefits(src) {
  const benefits = [];
  const benefitBlocks = src.split(/\n\s*\{\s*\n\s*brandId:/).slice(1);
  for (const block of benefitBlocks) {
    // Allow multiline find() / optional chaining (e.g. Super-Pharm in seed.js):
    //   brandId: createdBrands.find((b) => b.name === '...')
    //     ?.id,
    //   brandId: createdBrands.find(
    //     (b) => b.name === '...'
    //   )?.id,
    const brandName =
      block.match(
        /createdBrands\.find\(\s*\(\s*b\s*\)\s*=>\s*b\.name\s*===\s*(['"`])([\s\S]*?)\1\s*\)/
      )?.[2] || null;
    const title = block.match(/title:\s*(['"`])([\s\S]*?)\1/)?.[2];
    const url = block.match(/\burl:\s*(['"`])([\s\S]*?)\1/)?.[2] || null;
    const validityType =
      block.match(/validityType:\s*(['"`])([\s\S]*?)\1/)?.[2] || null;
    const isFreeMatch = block.match(/isFree:\s*(true|false)/);
    if (!title) continue;
    benefits.push({
      brandName,
      title,
      url,
      validityType,
      isFree: isFreeMatch ? isFreeMatch[1] === 'true' : null,
    });
  }
  return benefits;
}

/**
 * @param {string} [seedPath]
 * @returns {{ source: string, softBrandNames: string[], brands: object[], benefits: object[] }}
 */
function parseSeedCatalog(seedPath = DEFAULT_SEED_PATH) {
  const src = readSeedSource(seedPath);
  return {
    source: path.resolve(seedPath),
    softBrandNames: parseSoftBrandNames(src),
    brands: parseBrands(src),
    benefits: parseBenefits(src),
  };
}

/**
 * Structural catalog checks (seed as SoT). Returns { errors, warnings }.
 * @param {{ softBrandNames: string[], brands: object[], benefits: object[] }} catalog
 */
function analyzeCatalogStructure(catalog) {
  const errors = [];
  const warnings = [];
  const brandNames = catalog.brands.map((b) => b.name);
  const brandSet = new Set(brandNames);
  const softSet = new Set(catalog.softBrandNames);

  const seenNames = new Set();
  for (const name of brandNames) {
    if (seenNames.has(name)) {
      errors.push(`Duplicate brand name: ${name}`);
    }
    seenNames.add(name);
  }

  for (const brand of catalog.brands) {
    if (!brand.website) {
      errors.push(`Brand missing website: ${brand.name}`);
    }
    if (!brand.actionUrl) {
      warnings.push(
        `Brand missing actionUrl (deep-link optional): ${brand.name}`
      );
    }
  }

  for (const soft of catalog.softBrandNames) {
    if (!brandSet.has(soft)) {
      errors.push(`SOFT_BRAND_NAMES entry not in predefinedBrands: ${soft}`);
    }
  }

  const benefitKeys = new Set();
  for (const benefit of catalog.benefits) {
    if (!benefit.brandName) {
      errors.push(`Benefit missing brand name resolution: ${benefit.title}`);
      continue;
    }
    if (!brandSet.has(benefit.brandName)) {
      errors.push(
        `Benefit brand not in predefinedBrands: ${benefit.brandName} — ${benefit.title}`
      );
    }
    if (!benefit.validityType) {
      errors.push(
        `Benefit missing validityType: ${benefit.brandName} — ${benefit.title}`
      );
    }
    const key = `${benefit.brandName}::${benefit.title}`;
    if (benefitKeys.has(key)) {
      errors.push(`Duplicate benefit title for brand: ${key}`);
    }
    benefitKeys.add(key);
  }

  const brandsWithBenefits = new Set(
    catalog.benefits.map((b) => b.brandName).filter(Boolean)
  );
  for (const name of brandNames) {
    if (!brandsWithBenefits.has(name)) {
      const softNote = softSet.has(name) ? ' (soft/unverified)' : '';
      warnings.push(`Brand has no seeded benefits: ${name}${softNote}`);
    }
  }

  return { errors, warnings };
}

/**
 * Compare seed catalog to DB rows (name/title level). Does not wipe or mutate.
 * @param {{ brands: {name:string}[], benefits: {brandName:string|null,title:string}[] }} seed
 * @param {{ brands: {name:string}[], benefits: {brandName:string,title:string,verified?:boolean,lastChecked?:Date|string|null}[] }} db
 */
function analyzeSeedDbDrift(seed, db) {
  const errors = [];
  const warnings = [];

  const seedBrandNames = new Set(seed.brands.map((b) => b.name));
  const dbBrandNames = new Set(db.brands.map((b) => b.name));

  for (const name of seedBrandNames) {
    if (!dbBrandNames.has(name)) {
      errors.push(`Seed brand missing from DB: ${name}`);
    }
  }
  for (const name of dbBrandNames) {
    if (!seedBrandNames.has(name)) {
      warnings.push(`DB brand not in seed (custom/orphan?): ${name}`);
    }
  }

  const seedKeys = new Set(
    seed.benefits
      .filter((b) => b.brandName)
      .map((b) => `${b.brandName}::${b.title}`)
  );
  const dbKeys = new Set(db.benefits.map((b) => `${b.brandName}::${b.title}`));

  for (const key of seedKeys) {
    if (!dbKeys.has(key)) {
      errors.push(`Seed benefit missing from DB: ${key}`);
    }
  }
  for (const key of dbKeys) {
    if (!seedKeys.has(key)) {
      warnings.push(`DB benefit not in seed: ${key}`);
    }
  }

  return { errors, warnings };
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  const t = Date.parse(
    typeof isoDate === 'string'
      ? String(isoDate).slice(0, 10)
      : new Date(isoDate).toISOString().slice(0, 10)
  );
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

/**
 * Queue verified benefits whose lastChecked is older than staleDays (or missing).
 * Seed mode: researched brands (not soft) with benefits — seasonal review queue.
 * DB mode: uses Benefit.verified + lastChecked.
 */
function analyzeStaleVerified(options) {
  const { mode, softBrandNames = [], benefits = [], staleDays = 180 } = options;
  const softSet = new Set(softBrandNames);
  const stale = [];
  const ok = [];

  if (mode === 'seed') {
    for (const b of benefits) {
      if (!b.brandName) continue;
      const researched = !softSet.has(b.brandName);
      if (!researched) continue;
      stale.push({
        brandName: b.brandName,
        title: b.title,
        verified: true,
        lastChecked: null,
        daysSince: null,
        reason: 'seed-researched-queue',
      });
    }
    return { stale, ok, staleDays, mode };
  }

  // db mode
  for (const b of benefits) {
    if (!b.verified) continue;
    const d = daysSince(b.lastChecked);
    const entry = {
      brandName: b.brandName,
      title: b.title,
      verified: true,
      lastChecked: b.lastChecked
        ? new Date(b.lastChecked).toISOString().slice(0, 10)
        : null,
      daysSince: d,
      reason: null,
    };
    if (d === null) {
      entry.reason = 'verified-missing-lastChecked';
      stale.push(entry);
    } else if (d > staleDays) {
      entry.reason = `lastChecked>${staleDays}d`;
      stale.push(entry);
    } else {
      ok.push(entry);
    }
  }

  return { stale, ok, staleDays, mode: 'db' };
}

module.exports = {
  DEFAULT_SEED_PATH,
  readSeedSource,
  parseSoftBrandNames,
  parseBrands,
  parseBenefits,
  parseSeedCatalog,
  analyzeCatalogStructure,
  analyzeSeedDbDrift,
  analyzeStaleVerified,
  daysSince,
};
