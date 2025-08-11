import { render, screen } from '@testing-library/react'
import DemoPage from '@/app/demo/page'

describe('DemoPage extra assertions', () => {
  it('renders quick actions and brand cards', () => {
    render(<DemoPage />)
    expect(screen.getByText(/YomU/)).toBeInTheDocument()
    expect(screen.getAllByRole('img').length).toBeGreaterThan(1)
  })
})


