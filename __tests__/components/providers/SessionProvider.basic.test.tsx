import { render, screen } from '@testing-library/react'
import { SessionProvider } from '@/components/providers/SessionProvider'

describe('SessionProvider basic', () => {
  it('renders children', () => {
    render(
      <SessionProvider>
        <div>child</div>
      </SessionProvider>
    )
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})


