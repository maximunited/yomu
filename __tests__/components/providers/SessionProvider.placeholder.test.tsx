import { SessionProvider as Provider } from '@/components/providers/SessionProvider'
import { render } from '@testing-library/react'

describe('SessionProvider placeholder', () => {
  it('renders children', () => {
    const { container } = render(<Provider><div>ok</div></Provider>)
    expect(container.textContent).toContain('ok')
  })
})


