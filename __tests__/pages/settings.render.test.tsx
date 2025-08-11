import { render, screen } from '@testing-library/react'
import SettingsPage from '@/app/settings/page'

describe('SettingsPage (render)', () => {
  it('renders headings and sections without crashing', () => {
    render(<SettingsPage />)
    expect(screen.getByText(/Settings|הגדרות|settings/i)).toBeInTheDocument()
    expect(screen.getByText(/Profile|פרופיל|profile/i)).toBeInTheDocument()
    expect(screen.getByText(/API Key|מפתח API|api key/i)).toBeInTheDocument()
    expect(screen.getByText(/Appearance|מראה|appearance/i)).toBeInTheDocument()
    expect(screen.getByText(/Language|שפה|language/i)).toBeInTheDocument()
    expect(screen.getByText(/Notifications|התראות|notifications/i)).toBeInTheDocument()
  })
})


