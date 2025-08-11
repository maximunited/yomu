import { render, screen } from '@testing-library/react'
import TermsPage from '@/app/terms/page'

describe('TermsPage (render)', () => {
  it('renders terms sections', () => {
    render(<TermsPage />)
    expect(screen.getByText(/terms|תנאים/i)).toBeInTheDocument()
    expect(screen.getByText(/service|שירות|usage/i)).toBeInTheDocument()
  })
})


