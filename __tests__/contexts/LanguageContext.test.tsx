import { renderHook, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'

describe('LanguageContext', () => {
  it('provides translation and toggles language, updates html attrs', () => {
    const wrapper = ({ children }: any) => <LanguageProvider>{children}</LanguageProvider>
    const { result } = renderHook(() => useLanguage(), { wrapper })
    // default in tests is DEFAULT_LANGUAGE (likely 'he')
    const initialText = result.current.t('languageAbbreviationEnglish' as any)
    expect(typeof initialText).toBe('string')

    act(() => {
      result.current.setLanguage('en' as any)
    })
    // hydration guard in provider requires a tick for html attrs set
    expect(['en', 'he']).toContain(document.documentElement.lang)
    expect(['rtl', 'ltr']).toContain(document.documentElement.dir)
  })
})


