/**
 * Catalog ops unit tests — parser + structural / drift / stale helpers.
 * No DB / network required.
 */
import path from 'path';
import fs from 'fs';

const {
  parseSeedCatalog,
  enrichCatalogBenefits,
  parseBrands,
  parseBenefits,
  parseSoftBrandNames,
  analyzeCatalogStructure,
  analyzeSeedDbDrift,
  analyzeStaleVerified,
  daysSince,
} = require('../../../scripts/lib/parse-seed-catalog');
const { MINNA_TOMEI_TERMS_URL } = require('../../../scripts/lib/terms-url');

describe('parse-seed-catalog', () => {
  it('parses live seed.js brands, benefits, and soft list', () => {
    const catalog = parseSeedCatalog();
    expect(catalog.brands.length).toBeGreaterThan(20);
    expect(catalog.benefits.length).toBeGreaterThan(20);
    expect(catalog.softBrandNames).toEqual(
      expect.arrayContaining(['Shufersal', 'Isracard', 'Golda'])
    );
    expect(catalog.softBrandNames).not.toContain('Honigman');
    expect(catalog.softBrandNames).not.toContain('H&M');
    expect(catalog.softBrandNames).not.toContain('שילב');
    const honigmanBenefit = catalog.benefits.find(
      (b: { brandName: string | null }) => b.brandName === 'Honigman'
    );
    expect(honigmanBenefit?.title).toMatch(/קיווי|ילדים/);
    expect(honigmanBenefit?.url).toMatch(/kiwi-kids\.co\.il/);
    const hmBenefit = catalog.benefits.find(
      (b: { brandName: string | null }) => b.brandName === 'H&M'
    );
    expect(hmBenefit?.title).toMatch(/יום הולדת/);
    const shilavBenefit = catalog.benefits.find(
      (b: { brandName: string | null }) => b.brandName === 'שילב'
    );
    expect(shilavBenefit?.title).toMatch(/Dream Card/);
    const terminalXBenefit = catalog.benefits.find(
      (b: { brandName: string | null }) => b.brandName === 'Terminal X'
    );
    expect(terminalXBenefit?.title).toMatch(/Dream Card/);
    const terminalXBrand = catalog.brands.find(
      (b: { name: string }) => b.name === 'Terminal X'
    );
    expect(terminalXBrand?.actionUrl).toMatch(/dreamcard\.co\.il/);
    const mcdonalds = catalog.brands.find(
      (b: { name: string }) => b.name === "McDonald's"
    );
    expect(mcdonalds?.website).toMatch(/^https:\/\//);
    expect(mcdonalds?.actionUrl).toMatch(/^https:\/\//);
    const benefit = catalog.benefits.find(
      (b: { brandName: string | null }) => b.brandName === "McDonald's"
    );
    expect(benefit?.title).toMatch(/גלידה פיצוץ/);
    expect(benefit?.validityType).toBe('birthday_10_days_after');
  });

  it('analyzeCatalogStructure reports clean on live seed', () => {
    const catalog = parseSeedCatalog();
    const { errors } = analyzeCatalogStructure(catalog);
    expect(errors).toEqual([]);
  });

  it('every live seed benefit resolves a termsUrl', () => {
    const catalog = parseSeedCatalog();
    const enriched = enrichCatalogBenefits(catalog);
    const missing = enriched.filter((b) => !b.termsUrl);
    expect(missing).toEqual([]);
    const minna = enriched.find((b) => b.brandName === 'Minna Tomei');
    expect(minna?.termsUrl).toBe(MINNA_TOMEI_TERMS_URL);
  });

  it('flags duplicate brands and soft-list / benefit orphans', () => {
    const { errors, warnings } = analyzeCatalogStructure({
      softBrandNames: ['SoftOnly'],
      brands: [
        {
          name: 'A',
          website: 'https://a.example',
          actionUrl: null,
          category: 'food',
        },
        {
          name: 'A',
          website: 'https://a2.example',
          actionUrl: 'https://a2.example',
          category: 'food',
        },
      ],
      benefits: [
        {
          brandName: 'MissingBrand',
          title: 'X',
          url: null,
          validityType: 'birthday_exact_date',
          isFree: true,
        },
      ],
    });
    expect(errors.some((e: string) => e.includes('Duplicate brand'))).toBe(
      true
    );
    expect(warnings.some((w: string) => w.includes('missing actionUrl'))).toBe(
      true
    );
    expect(
      errors.some((e: string) => e.includes('SOFT_BRAND_NAMES entry not in'))
    ).toBe(true);
    expect(errors.some((e: string) => e.includes('Benefit brand not in'))).toBe(
      true
    );
  });

  it('analyzeSeedDbDrift detects missing and extra rows', () => {
    const seed = {
      brands: [{ name: 'A' }, { name: 'B' }],
      benefits: [
        { brandName: 'A', title: 'T1', termsUrl: 'https://a.example/terms' },
        { brandName: 'B', title: 'T2', termsUrl: 'https://b.example/terms' },
      ],
    };
    const db = {
      brands: [{ name: 'A' }, { name: 'C' }],
      benefits: [
        { brandName: 'A', title: 'T1', termsUrl: 'https://a.example/terms' },
        { brandName: 'C', title: 'Extra', termsUrl: 'https://c.example/terms' },
      ],
    };
    const { errors, warnings } = analyzeSeedDbDrift(seed, db);
    expect(errors).toEqual(
      expect.arrayContaining([
        'Seed brand missing from DB: B',
        'Seed benefit missing from DB: B::T2',
      ])
    );
    expect(warnings).toEqual(
      expect.arrayContaining([
        'DB brand not in seed (custom/orphan?): C',
        'DB benefit not in seed: C::Extra',
      ])
    );
  });

  it('analyzeStaleVerified db mode uses stale-days threshold', () => {
    const old = new Date();
    old.setDate(old.getDate() - 200);
    const recent = new Date();
    recent.setDate(recent.getDate() - 10);
    const report = analyzeStaleVerified({
      mode: 'db',
      staleDays: 180,
      benefits: [
        {
          brandName: 'OldCo',
          title: 'Old',
          verified: true,
          lastChecked: old,
        },
        {
          brandName: 'FreshCo',
          title: 'Fresh',
          verified: true,
          lastChecked: recent,
        },
        {
          brandName: 'Soft',
          title: 'Unverified',
          verified: false,
          lastChecked: null,
        },
        {
          brandName: 'NoDate',
          title: 'VerifiedNoDate',
          verified: true,
          lastChecked: null,
        },
      ],
    });
    expect(report.stale.map((s: { title: string }) => s.title).sort()).toEqual([
      'Old',
      'VerifiedNoDate',
    ]);
    expect(report.ok.map((s: { title: string }) => s.title)).toEqual(['Fresh']);
  });

  it('analyzeStaleVerified seed mode queues non-soft benefits', () => {
    const report = analyzeStaleVerified({
      mode: 'seed',
      softBrandNames: ['Soft'],
      benefits: [
        { brandName: 'Hard', title: 'A' },
        { brandName: 'Soft', title: 'B' },
      ],
    });
    expect(report.stale).toHaveLength(1);
    expect(report.stale[0].brandName).toBe('Hard');
    expect(report.stale[0].reason).toBe('seed-researched-queue');
  });

  it('daysSince returns null for invalid dates', () => {
    expect(daysSince(null)).toBeNull();
    expect(daysSince('not-a-date')).toBeNull();
    expect(daysSince('2020-01-01')).toBeGreaterThan(100);
  });

  it('parse helpers tolerate minimal seed fixtures', () => {
    const src = `
const SOFT_BRAND_NAMES = new Set(['Soft']);
const predefinedBrands = [
  {
    name: 'Soft',
    website: 'https://soft.example',
    actionUrl: 'https://soft.example/app',
    category: 'other',
  },
  {
    name: 'Hard',
    website: 'https://hard.example',
    actionUrl: 'https://hard.example',
    category: 'food',
  },
];
const sampleBenefits = [
  {
    brandId: createdBrands.find((b) => b.name === 'Hard')?.id,
    title: 'Gift',
    url: 'https://hard.example/b',
    validityType: 'birthday_exact_date',
    isFree: true,
  },
];
`;
    expect(parseSoftBrandNames(src)).toEqual(['Soft']);
    expect(parseBrands(src)).toHaveLength(2);
    expect(parseBenefits(src)[0].brandName).toBe('Hard');
  });

  it('parses multiline brandId find / optional chaining (Super-Pharm pattern)', () => {
    const src = `
const predefinedBrands = [
  {
    name: 'Super-Pharm - LifeStyle',
    website: 'https://www.super-pharm.co.il',
    actionUrl: 'https://www.super-pharm.co.il',
    category: 'health',
  },
];
const sampleBenefits = [
  {
    brandId: createdBrands.find((b) => b.name === 'Super-Pharm - LifeStyle')
      ?.id,
    title: '20% הנחה על כל הקנייה',
    url: 'https://www.super-pharm.co.il',
    validityType: 'birthday_entire_month',
    isFree: false,
  },
  {
    brandId: createdBrands.find(
      (b) => b.name === 'Super-Pharm - LifeStyle'
    )?.id,
    title: 'Alt multiline find',
    validityType: 'birthday_exact_date',
    isFree: true,
  },
  {
    brandId: createdBrands.find((b) => b.name === 'Super-Pharm - LifeStyle'
)?.id,
    title: 'Paren before optional chain',
    validityType: 'birthday_week_before_after',
    isFree: false,
  },
];
`;
    const benefits = parseBenefits(src);
    expect(benefits).toHaveLength(3);
    expect(
      benefits.every(
        (b: { brandName: string | null }) =>
          b.brandName === 'Super-Pharm - LifeStyle'
      )
    ).toBe(true);
    expect(benefits[0].title).toBe('20% הנחה על כל הקנייה');
  });
});

describe('audit-loyalty-urls lastGoodAt merge', () => {
  const {
    buildLastGoodStatus,
  } = require('../../../scripts/audit-loyalty-urls');

  it('preserves prior lastGoodAt when current check fails', () => {
    const priorGood = '2026-07-01T00:00:00.000Z';
    const checkedAt = '2026-08-13T00:00:00.000Z';
    const prior = {
      checkedAt: priorGood,
      source: 'audit-loyalty-urls',
      urls: [
        {
          kind: 'brand',
          label: 'A',
          url: 'https://a.example',
          ok: true,
          lastGoodAt: priorGood,
        },
        {
          kind: 'brand',
          label: 'B',
          url: 'https://b.example',
          ok: true,
          lastGoodAt: priorGood,
        },
      ],
    };
    const results = [
      {
        kind: 'brand',
        label: 'A',
        url: 'https://a.example',
        ok: false,
        blocked: false,
        status: 500,
        error: null,
        lastChecked: null,
      },
      {
        kind: 'brand',
        label: 'B',
        url: 'https://b.example',
        ok: true,
        blocked: false,
        status: 200,
        error: null,
        lastChecked: null,
      },
      {
        kind: 'brand',
        label: 'C',
        url: 'https://c.example',
        ok: false,
        blocked: false,
        status: null,
        error: 'timeout',
        lastChecked: null,
      },
    ];
    const doc = buildLastGoodStatus(results, checkedAt, prior);
    expect(
      doc.urls.find((u: { url: string }) => u.url === 'https://a.example')
        ?.lastGoodAt
    ).toBe(priorGood);
    expect(
      doc.urls.find((u: { url: string }) => u.url === 'https://b.example')
        ?.lastGoodAt
    ).toBe(checkedAt);
    expect(
      doc.urls.find((u: { url: string }) => u.url === 'https://c.example')
        ?.lastGoodAt
    ).toBeNull();
  });

  it('sets lastGoodAt to checkedAt when ok and no prior', () => {
    const checkedAt = '2026-08-13T12:00:00.000Z';
    const doc = buildLastGoodStatus(
      [
        {
          kind: 'brand',
          label: 'A',
          url: 'https://a.example',
          ok: true,
          blocked: false,
          status: 200,
          error: null,
          lastChecked: null,
        },
      ],
      checkedAt,
      null
    );
    expect(doc.urls[0].lastGoodAt).toBe(checkedAt);
  });
});

describe('catalog ops scripts exist', () => {
  it('ships drift and stale entrypoints', () => {
    const root = process.cwd();
    expect(
      fs.existsSync(path.join(root, 'scripts', 'check-catalog-drift.js'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(root, 'scripts', 'report-stale-verified.js'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(root, 'scripts', 'lib', 'parse-seed-catalog.js'))
    ).toBe(true);
  });
});
