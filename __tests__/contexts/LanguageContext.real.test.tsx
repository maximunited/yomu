/** This test bypasses the global mock to cover the real LanguageContext implementation */
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { translations } from '@/lib/translations'

describe('LanguageContext (real implementation)', () => {
  beforeEach(() => {
    localStorage.removeItem('language')
  })

  it('initializes with DEFAULT_LANGUAGE and updates document and storage on setLanguage', async () => {
    const { LanguageProvider, useLanguage } = (jest.requireActual('@/contexts/LanguageContext') as any)

    const wrapper = ({ children }: any) => React.createElement(LanguageProvider, null, children)

    const { result } = renderHook(() => useLanguage(), { wrapper })

    // Wait for hydration effect to run
    await new Promise((r) => setTimeout(r, 0))

    act(() => {
      result.current.setLanguage('en')
    })

    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(localStorage.getItem('language')).toBe('en')
    expect(result.current.t('back')).toBe(translations.en.back)
  })
})


