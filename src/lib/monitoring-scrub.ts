/**
 * Edge/browser-safe Sentry scrubbing — no Node built-ins.
 * Import from here in sentry.*.config and instrumentation-client.
 */

/** Matches common email shapes in free-form Sentry strings. */
const EMAIL_LIKE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

export function scrubEmailLikeText(value: string): string {
  return value.replace(EMAIL_LIKE, '[email-redacted]');
}

export function scrubUnknown(value: unknown): unknown {
  if (typeof value === 'string') return scrubEmailLikeText(value);
  if (Array.isArray(value)) return value.map(scrubUnknown);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = scrubUnknown(nested);
    }
    return out;
  }
  return value;
}

/**
 * Defense-in-depth beforeSend: strip email-like substrings from event payloads.
 * Does not remove opaque IDs intentionally placed in tags/extra.
 */
export function scrubSentryEvent<T extends Record<string, unknown>>(
  event: T
): T {
  const next = { ...event } as T & {
    message?: string;
    logentry?: { message?: string; formatted?: string };
    exception?: { values?: Array<{ value?: string; type?: string }> };
    breadcrumbs?: Array<{ message?: string; data?: Record<string, unknown> }>;
    extra?: Record<string, unknown>;
  };

  if (typeof next.message === 'string') {
    next.message = scrubEmailLikeText(next.message);
  }

  if (next.logentry) {
    if (typeof next.logentry.message === 'string') {
      next.logentry = {
        ...next.logentry,
        message: scrubEmailLikeText(next.logentry.message),
      };
    }
    if (typeof next.logentry.formatted === 'string') {
      next.logentry = {
        ...next.logentry,
        formatted: scrubEmailLikeText(next.logentry.formatted),
      };
    }
  }

  if (next.exception?.values) {
    next.exception = {
      ...next.exception,
      values: next.exception.values.map((item) =>
        item && typeof item.value === 'string'
          ? { ...item, value: scrubEmailLikeText(item.value) }
          : item
      ),
    };
  }

  if (Array.isArray(next.breadcrumbs)) {
    next.breadcrumbs = next.breadcrumbs.map((crumb) => {
      const scrubbed = { ...crumb };
      if (typeof scrubbed.message === 'string') {
        scrubbed.message = scrubEmailLikeText(scrubbed.message);
      }
      if (scrubbed.data) {
        scrubbed.data = scrubUnknown(scrubbed.data) as Record<string, unknown>;
      }
      return scrubbed;
    });
  }

  if (next.extra) {
    next.extra = scrubUnknown(next.extra) as Record<string, unknown>;
  }

  return next;
}
