import { render, screen } from '@testing-library/react'
import ContactPage from '@/app/contact/page'

describe('ContactPage (render)', () => {
  it('renders contact heading and form controls', () => {
    render(<ContactPage />)
    expect(screen.getAllByText(/contact|צור קשר/i)[0]).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/name|שם/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email|דוא"ל|מייל|your email/i)).toBeInTheDocument()
  })
})


