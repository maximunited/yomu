import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button variant/size combos', () => {
  it('renders destructive lg', () => {
    render(<Button variant="destructive" size="lg">Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })
})


