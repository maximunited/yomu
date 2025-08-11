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
})


