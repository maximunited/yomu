import { cn } from '@/lib/utils'

describe('cn (edge cases)', () => {
  it('dedupes duplicates and ignores falsy', () => {
    expect(cn('a', null as any, undefined as any, 'a', false as any, 'b')).toBe('a b')
  })
})


