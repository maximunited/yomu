import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button accessibility aria', () => {
  it('omits aria-disabled when not disabled', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled')
  })
})


