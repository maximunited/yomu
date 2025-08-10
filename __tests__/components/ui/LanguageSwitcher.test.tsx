import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('renders and toggles without error', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText(/EN|HE/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
  })
})


