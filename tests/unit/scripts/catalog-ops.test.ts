/**
 * Catalog ops unit tests — parser + structural / drift / stale helpers.
 * No DB / network required.
 */
import path from 'path';
import fs from 'fs';

const {
  parseSeedCatalog,
  parseBrands,
  parseBenefits,
  parseSoftBrandNames,
  analyzeCatalogStructure,
  analyzeSeedDbDrift,
  analyzeStaleVerified,
  daysSince,
} = require('../../../scripts/lib/parse-seed-catalog');

describe('parse-seed-catalog', () => {
  it('parses live seed.js brands, benefits, and soft list', () => {
    const catalog = parseSeedCatalog();
    expect(catalog.brands.length).toBeGreaterThan(20);
    expect(catalog.benefits.length).toBeGreaterThan(20);
    expect(catalog.softBrandNames).toEqual(
      expect.arrayContaining(['H&M', 'Shufersal', 'Isracard'])
    );
    const mcdonalds = catalog.brands.find((b: { name: string }) => b.name === "McDonald's");
    expect(mcdonalds?.website).toMatch(/^https:\/\//);
    expect(mcdonalds?.actionUrl).toMatch(/^https:\/\//);
    const benefit = catalog.benefits.find(
      (b: { brandName: string | null }) => b.brandName === "McDonald's"
    );
    expect(benefit?.title).toBeTruthy();
    expect(benefit?.validityType).toBeTruthy();
  });

  it('analyzeCatalogStructure reports clean on live seed', () => {
    const catalog = parseSeedCatalog();
    const { errors } = analyzeCatalogStructure(catalog);
    expect(errors).toEqual([]);
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
    expect(
      warnings.some((w: string) => w.includes('missing actionUrl'))
    ).toBe(true);
    expect(
      errors.some((e: string) => e.includes('SOFT_BRAND_NAMES entry not in'))
    ).toBe(true);
    expect(
      errors.some((e: string) => e.includes('Benefit brand not in'))
    ).toBe(true);
  });

  it('analyzeSeedDbDrift detects missing and extra rows', () => {
    const seed = {
      brands: [{ name: 'A' }, { name: 'B' }],
      benefits: [
        { brandName: 'A', title: 'T1' },
        { brandName: 'B', title: 'T2' },
      ],
    };
    const db = {
      brands: [{ name: 'A' }, { name: 'C' }],
      benefits: [
        { brandName: 'A', title: 'T1' },
        { brandName: 'C', title: 'Extra' },
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
    expect(report.stale.map((s: { title: string }) => s.title).sort()).toEqual(
      ['Old', 'VerifiedNoDate']
    );
    expect(report.ok.map((s: { title: string }) => s.title)).toEqual([
      'Fresh',
    ]);
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
