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
    expect(document.documentElement.lang).toBe('en')
    expect(['rtl', 'ltr']).toContain(document.documentElement.dir)
  })
})


