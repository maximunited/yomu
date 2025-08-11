import { render, screen } from '@testing-library/react'
import PageHeader from '@/components/PageHeader'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

describe('PageHeader backHref', () => {
  it('renders back link with custom href', () => {
    render(
      <DarkModeProvider>
        <LanguageProvider>
          <PageHeader title="T" backHref="/custom" />
        </LanguageProvider>
      </DarkModeProvider>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/custom')
  })
})


