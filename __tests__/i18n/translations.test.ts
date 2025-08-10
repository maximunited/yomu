import { translations } from '@/lib/translations'

describe('i18n translations', () => {
  it('has both he and en locales', () => {
    expect(Object.keys(translations).sort()).toEqual(['en', 'he'])
  })

  it('contains core keys in both locales', () => {
    const coreKeys = ['home', 'dashboard', 'signIn', 'save', 'cancel', 'about']
    for (const key of coreKeys) {
      expect((translations.he as any)[key]).toBeTruthy()
      expect((translations.en as any)[key]).toBeTruthy()
    }
  })

  it('language abbreviations are consistent', () => {
    expect(translations.he.languageAbbreviationHebrew).toBeTruthy()
    expect(translations.en.languageAbbreviationEnglish).toBeTruthy()
  })
})


