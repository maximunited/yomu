import { renderHook } from '@testing-library/react'
import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext'

describe('DarkModeContext system preference', () => {
  it('defaults to system prefers dark when no saved setting', () => {
    // simulate system prefers dark
    // @ts-ignore
    window.matchMedia = jest.fn().mockImplementation(() => ({ matches: true }))
    const wrapper = ({ children }: any) => <DarkModeProvider>{children}</DarkModeProvider>
    const { result } = renderHook(() => useDarkMode(), { wrapper })
    // After mount effect, isDarkMode should reflect system preference
    expect(result.current.isDarkMode).toBe(true)
  })
})


