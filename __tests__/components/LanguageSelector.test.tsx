import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSelector from '@/components/LanguageSelector'
import { LanguageProvider } from '@/contexts/LanguageContext'

const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('LanguageSelector', () => {
  it('renders dropdown and opens menu', () => {
    render(<LanguageSelector />, { wrapper: Wrapper as any })
    expect(screen.getByText(/language|שפה/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText(/fully supported|שפות נתמכות/i)).toBeInTheDocument()
  })

  it('supports compact variant toggle', () => {
    render(<LanguageSelector variant="compact" />, { wrapper: Wrapper as any })
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    // list should appear
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
  })

  it('supports button variant render', () => {
    render(<LanguageSelector variant="button" />, { wrapper: Wrapper as any })
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})


