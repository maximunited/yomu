import { renderHook, act } from '@testing-library/react'
import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext'

describe('DarkModeContext', () => {
  it('toggles dark mode and persists to localStorage', () => {
    const wrapper = ({ children }: any) => <DarkModeProvider>{children}</DarkModeProvider>
    const { result } = renderHook(() => useDarkMode(), { wrapper })
    act(() => {
      result.current.setDarkMode(false)
    })
    act(() => {
      result.current.toggleDarkMode()
    })
    expect(result.current.isDarkMode).toBe(true)
    expect(localStorage.getItem('darkMode')).toBe('true')
  })
})


