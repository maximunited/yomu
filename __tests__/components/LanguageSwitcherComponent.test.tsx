import { render, screen } from '@testing-library/react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { LanguageProvider } from '@/contexts/LanguageContext'

describe('LanguageSwitcher (wrapper)', () => {
  it('renders compact selector', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})


