import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'px-4', false && 'hidden')).toContain('px-4');
  });
});
