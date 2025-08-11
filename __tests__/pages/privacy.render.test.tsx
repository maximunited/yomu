import { render, screen } from '@testing-library/react'
import PrivacyPage from '@/app/privacy/page'

describe('PrivacyPage (render)', () => {
  it('renders privacy sections', () => {
    render(<PrivacyPage />)
    expect(screen.getAllByText(/privacy|פרטיות/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/security|אבטחה/i)).toBeInTheDocument()
  })
})


