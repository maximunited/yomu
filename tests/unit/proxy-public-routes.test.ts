/**
 * Public allowlist must not include dangerous admin/seed/setup/test routes.
 */
import { PUBLIC_ROUTES } from '@/proxy';

describe('proxy PUBLIC_ROUTES', () => {
  const dangerousPrefixes = [
    '/api/seed',
    '/api/setup',
    '/api/test-prisma',
    '/api/test-users',
    '/api/admin',
    '/admin',
  ];

  it('exports a non-empty allowlist', () => {
    expect(PUBLIC_ROUTES.length).toBeGreaterThan(0);
  });

  it.each(dangerousPrefixes)('does not publicly allow %s', (prefix) => {
    const leaked = PUBLIC_ROUTES.some(
      (route) =>
        route === prefix ||
        route.startsWith(`${prefix}(`) ||
        route.startsWith(`${prefix}/`) ||
        route.includes(prefix)
    );
    expect(leaked).toBe(false);
  });

  it('still allows webhooks and marketing surfaces', () => {
    expect(PUBLIC_ROUTES).toEqual(
      expect.arrayContaining([
        '/',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/api/webhooks(.*)',
      ])
    );
  });
});
