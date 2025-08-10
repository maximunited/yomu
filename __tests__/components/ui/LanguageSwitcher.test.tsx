import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import * as LanguageContext from '@/contexts/LanguageContext'

describe('LanguageSwitcher', () => {
  it('toggles language label on click', () => {
    const setLanguage = jest.fn()
    jest.spyOn(LanguageContext, 'useLanguage').mockReturnValue({
      t: (k: string) => (k === 'languageAbbreviationEnglish' ? 'EN' : 'HE'),
      language: 'he',
      setLanguage,
      dir: 'rtl',
      languageInfo: { code: 'he', dir: 'rtl', isRTL: true },
      isRTL: true,
    } as any)

    render(<LanguageSwitcher />)

    expect(screen.getByText('EN')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(setLanguage).toHaveBeenCalledWith('en')
  })
})


