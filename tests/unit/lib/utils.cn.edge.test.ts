import { cn } from '@/lib/utils';

describe('cn (edge cases)', () => {
  it('handles falsy values and combines classes', () => {
    expect(cn('a', null as any, undefined as any, 'b', false as any, 'c')).toBe(
      'a b c'
    );
  });

  it('merges duplicate Tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
