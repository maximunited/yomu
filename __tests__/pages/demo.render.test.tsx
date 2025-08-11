import { render, screen } from '@testing-library/react'
import DemoPage from '@/app/demo/page'

describe('DemoPage (render)', () => {
  it('renders demo header and active section', () => {
    render(<DemoPage />)
    expect(screen.getByText(/YomU/)).toBeInTheDocument()
    expect(screen.getByText(/Active|זמין עכשיו|active/i)).toBeInTheDocument()
  })
})


