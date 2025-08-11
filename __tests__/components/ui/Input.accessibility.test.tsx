import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input accessibility', () => {
  it('associates label via htmlFor/id', () => {
    render(<><label htmlFor="email">Email</label><Input id="email" /></>)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})


