import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSelector from '@/components/LanguageSelector'
import { LanguageProvider } from '@/contexts/LanguageContext'

const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('LanguageSelector font face consistency', () => {
  it('selection trigger and dropdown item use the same font-family (default dropdown variant)', () => {
    render(<LanguageSelector variant="dropdown" />, { wrapper: Wrapper as any })

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const englishNodes = screen.getAllByText('English')
    const englishItem = (englishNodes.find(node => node.closest('button')) as HTMLElement).closest('button') as HTMLElement

    const triggerFont = window.getComputedStyle(trigger).fontFamily
    const itemFont = window.getComputedStyle(englishItem).fontFamily

    expect(triggerFont).toBe(itemFont)
  })

  it('selection trigger and dropdown item use the same font-family (compact variant)', () => {
    render(<LanguageSelector variant="compact" />, { wrapper: Wrapper as any })

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const englishNodes = screen.getAllByText('English')
    const englishItem = (englishNodes.find(node => node.closest('button')) as HTMLElement).closest('button') as HTMLElement

    const triggerFont = window.getComputedStyle(trigger).fontFamily
    const itemFont = window.getComputedStyle(englishItem).fontFamily

    expect(triggerFont).toBe(itemFont)
  })
})


