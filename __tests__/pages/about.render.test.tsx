import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'

describe('AboutPage (render)', () => {
  it('renders headings and sections', () => {
    render(<AboutPage />)
    expect(screen.getByText(/about|על/i)).toBeInTheDocument()
    expect(screen.getByText(/mission|חזון|vision/i)).toBeInTheDocument()
    expect(screen.getByText(/team|צוות/i)).toBeInTheDocument()
  })
})


