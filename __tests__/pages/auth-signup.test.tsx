import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpPage from '@/app/auth/signup/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(async () => ({ ok: true })),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('SignUpPage', () => {
  it('validates mismatched passwords', async () => {
    const Wrapper = ({ children }: any) => <DarkModeProvider>{children}</DarkModeProvider>
    render(<SignUpPage />, { wrapper: Wrapper as any })
    fireEvent.change(screen.getByLabelText(/^אימייל$|^Email$/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/^סיסמה$|^Password$/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByLabelText(/^אימות סיסמה$|^Confirm Password$/i), { target: { value: 'xxxxxx' } })
    fireEvent.click(screen.getByRole('button', { name: /^צור חשבון$|^Create Account$/i }))
    await waitFor(() => expect(screen.getByText(/passwords do not match|הסיסמאות לא תואמות/i)).toBeInTheDocument())
  })

  it('shows API error on signup failure', async () => {
    // mock fetch to return error
    const originalFetch = global.fetch
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Error' }) })
    const Wrapper = ({ children }: any) => <DarkModeProvider>{children}</DarkModeProvider>
    render(<SignUpPage />, { wrapper: Wrapper as any })
    fireEvent.change(screen.getByLabelText(/^אימייל$|^Email$/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/^סיסמה$|^Password$/i), { target: { value: 'goodpass' } })
    fireEvent.change(screen.getByLabelText(/^אימות סיסמה$|^Confirm Password$/i), { target: { value: 'goodpass' } })
    fireEvent.click(screen.getByRole('button', { name: /^צור חשבון$|^Create Account$/i }))
    await waitFor(() => expect(screen.getByText(/error|שגיאה/i)).toBeInTheDocument())
    // restore
    // @ts-ignore
    global.fetch = originalFetch
  })
})


