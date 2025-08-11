import { render, screen, fireEvent } from '@testing-library/react'
import OnboardingPage from '@/app/onboarding/page'

describe('OnboardingPage select + submit', () => {
  it('prevents submit with no brands then submits when selected', async () => {
    render(<OnboardingPage />)

    const continueBtn = screen.getByRole('button', { name: /continue|להמשיך|dashboard/i })
    fireEvent.click(continueBtn) // alerts in code are mocked in setup

    // select first brand card by clicking first image container
    const firstImg = screen.getAllByRole('img')[0]
    fireEvent.click(firstImg)

    fireEvent.click(continueBtn)
    expect(global.fetch).toHaveBeenCalled()
  })
})


