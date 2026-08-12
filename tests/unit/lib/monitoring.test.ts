import { captureException, captureMessage } from '@/lib/monitoring';

describe('monitoring helpers', () => {
  const originalDsn = process.env.SENTRY_DSN;
  const originalPublic = process.env.NEXT_PUBLIC_SENTRY_DSN;

  afterEach(() => {
    if (originalDsn === undefined) delete process.env.SENTRY_DSN;
    else process.env.SENTRY_DSN = originalDsn;
    if (originalPublic === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    else process.env.NEXT_PUBLIC_SENTRY_DSN = originalPublic;
  });

  it('no-ops when DSN is unset', async () => {
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    await expect(
      captureException(new Error('boom'), { tags: { area: 'test' } })
    ).resolves.toBeUndefined();
    await expect(
      captureMessage('hello', { level: 'warning' })
    ).resolves.toBeUndefined();
  });
});
