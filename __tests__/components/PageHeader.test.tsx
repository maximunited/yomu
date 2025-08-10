import { render, screen } from '@testing-library/react'
import PageHeader from '@/components/PageHeader'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <LanguageProvider>
    <DarkModeProvider>{children}</DarkModeProvider>
  </LanguageProvider>
)

describe('PageHeader', () => {
  it('renders title, back button and controls', () => {
    render(<PageHeader title="My Title" showBackButton backHref="/x" />, { wrapper: Providers as any })
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back|חזרה/i })).toBeInTheDocument()
  })

  it('hides back button when showBackButton is false', () => {
    render(<PageHeader title="No Back" showBackButton={false} />, { wrapper: Providers as any })
    const back = screen.queryByRole('button', { name: /back|חזרה/i })
    expect(back).toBeNull()
  })
})


