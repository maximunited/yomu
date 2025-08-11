import { cn } from '@/lib/utils'

describe('cn (objects and arrays)', () => {
  it('merges object conditionals and arrays', () => {
    const result = cn('a', { b: true, c: false }, ['d', null as any, undefined as any])
    expect(result).toBe('a b d')
  })
})


