import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('MembershipsPage category multi-select filter + styling', () => {
  it('allows selecting multiple categories and uses modern font/capitalize', async () => {
    jest.resetModules()
    // Authenticated session for rendering page
    jest.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1' } }, status: 'authenticated' }),
      signIn: jest.fn(),
      signOut: jest.fn(),
      SessionProvider: ({ children }: any) => children,
    }))

    // Force fallback data by making fetch throw
    const originalFetch = global.fetch
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.reject(new Error('network')))

    const { default: MembershipsPage } = require('@/app/memberships/page')

    render(<MembershipsPage />)

    // Multi-select element
    const select = await screen.findByDisplayValue([], { exact: false }).catch(() => {
      // fallback: query by role 'listbox' which is used for multiple selects
      return screen.getByRole('listbox')
    })

    // Styling expectations
    const className = (select as HTMLElement).getAttribute('class') || ''
    expect(className).toContain('font-sans')
    expect(className).toContain('capitalize')

    // Select multiple categories: food and fashion
    await userEvent.selectOptions(select, ['food', 'fashion'])

    // Expect only items from those categories to be visible (at least one known item from fallback)
    expect(await screen.findByText(/McDonald's|מקדונלד'ס|McDonald/i)).toBeInTheDocument()
    expect(screen.getByText(/Fox/i)).toBeInTheDocument()

    // A category not selected (e.g., health) should be filtered out if present
    const possiblyHealth = screen.queryByText(/Super-Pharm|לייף|LifeStyle/i)
    if (possiblyHealth) {
      // In some environments strings may vary; ensure not both categories selected include health
      expect(possiblyHealth).not.toBeVisible()
    }

    // restore fetch
    global.fetch = originalFetch
  })
})


