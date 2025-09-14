import { translations } from '@/lib/translations';

describe('translations have same keys for he and en', () => {
  it('no missing keys between locales', () => {
    const heKeys = Object.keys(translations.he);
    const enKeys = Object.keys(translations.en);
    const missingInEn = heKeys.filter((k) => !enKeys.includes(k));
    const missingInHe = enKeys.filter((k) => !heKeys.includes(k));
    expect(missingInEn).toEqual([]);
    expect(missingInHe).toEqual([]);
  });
});
