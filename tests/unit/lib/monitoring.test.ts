import {
  captureException,
  captureMessage,
  hashEmailPrefix,
  scrubEmailLikeText,
  scrubSentryEvent,
} from '@/lib/monitoring';

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

  it('hashes email to a stable hex prefix', () => {
    const a = hashEmailPrefix('User@Example.com');
    const b = hashEmailPrefix('user@example.com');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{12}$/);
    expect(a).not.toContain('@');
  });

  it('scrubs email-like text from strings and events', () => {
    expect(scrubEmailLikeText('user a@b.co linked')).toBe(
      'user [email-redacted] linked'
    );
    const scrubbed = scrubSentryEvent({
      message: 'conflict for jane@example.com',
      extra: { note: 'ping bob@corp.io' },
      exception: { values: [{ value: 'mail alice@x.com failed' }] },
    });
    expect(scrubbed.message).toBe('conflict for [email-redacted]');
    expect(scrubbed.extra).toEqual({ note: 'ping [email-redacted]' });
    expect(scrubbed.exception?.values?.[0]?.value).toBe(
      'mail [email-redacted] failed'
    );
  });
});
