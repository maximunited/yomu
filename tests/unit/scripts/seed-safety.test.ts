/**
 * Seed CLI safety guards (static contracts — no DB required).
 * Refuses --mode=fresh --brands=; wipe only inside mode === 'fresh'.
 */
import fs from 'fs';
import path from 'path';

describe('scripts/seed.js safety', () => {
  const seedPath = path.join(process.cwd(), 'scripts', 'seed.js');
  let source: string;

  beforeAll(() => {
    source = fs.readFileSync(seedPath, 'utf8');
  });

  it('defaults mode to upsert when --mode omitted', () => {
    expect(source).toMatch(
      /const mode = \(args\.mode \|\| ['"]upsert['"]\)\.toLowerCase\(\)/
    );
  });

  it('refuses --mode=fresh combined with --brands=', () => {
    expect(source).toContain(
      'Refusing --mode=fresh with --brands=. Fresh wipe is global; omit --brands or use --mode=upsert.'
    );
    expect(source).toMatch(
      /if \(mode === ['"]fresh['"]\)[\s\S]*?brandFilter\.length > 0[\s\S]*?throw new Error/
    );
  });

  it('gates catalog wipe deleteMany calls behind mode === fresh', () => {
    const freshBlock = source.match(
      /if \(mode === ['"]fresh['"]\) \{[\s\S]*?\} else \{/
    );
    expect(freshBlock).not.toBeNull();
    expect(freshBlock![0]).toMatch(/prisma\.benefit\.deleteMany/);
    expect(freshBlock![0]).toMatch(/prisma\.brand\.deleteMany/);

    // Upsert branch must not wipe (wide window catches deep deleteMany)
    const upsertMarker =
      'Mode: upsert. Existing data will be updated/created without wiping.';
    const upsertIdx = source.indexOf(upsertMarker);
    expect(upsertIdx).toBeGreaterThanOrEqual(0);
    const upsertWindow = source.slice(
      upsertIdx,
      upsertIdx + upsertMarker.length + 4000
    );
    expect(upsertWindow).not.toMatch(/deleteMany/);
  });

  it('does not wipe before mode is parsed', () => {
    const modeMarker = "args.mode || 'upsert'";
    const modeIdx = source.indexOf(modeMarker);
    expect(modeIdx).toBeGreaterThanOrEqual(0);
    const beforeMode = source.slice(0, modeIdx);
    expect(beforeMode).not.toMatch(/\.deleteMany\s*\(/);
  });
});
