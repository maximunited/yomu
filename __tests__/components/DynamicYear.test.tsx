import { render, screen } from '@testing-library/react'
import { DynamicYear } from '@/components/DynamicYear'

describe('DynamicYear', () => {
  it('renders current year', () => {
    const year = new Date().getFullYear().toString()
    render(<DynamicYear />)
    expect(screen.getByText(year)).toBeInTheDocument()
  })
})


