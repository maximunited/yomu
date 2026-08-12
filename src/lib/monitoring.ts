/**
 * Thin error-reporting helper. No-ops when Sentry DSN is unset.
 * Prefer this over importing @sentry/nextjs directly in API routes
 * so unit tests stay free of SDK wiring.
 */

import { createHash } from 'crypto';

type CaptureContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: 'fatal' | 'error' | 'warning' | 'info';
};

/** Matches common email shapes in free-form Sentry strings. */
const EMAIL_LIKE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

function hasDsn(): boolean {
  return Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/** SHA-256 hex prefix of a normalized email — safe for ops correlation. */
export function hashEmailPrefix(email: string, length = 12): string {
  const normalized = email.trim().toLowerCase();
  return createHash('sha256').update(normalized).digest('hex').slice(0, length);
}

export function scrubEmailLikeText(value: string): string {
  return value.replace(EMAIL_LIKE, '[email-redacted]');
}

function scrubUnknown(value: unknown): unknown {
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

export async function captureException(
  error: unknown,
  context?: CaptureContext
): Promise<void> {
  if (!hasDsn()) return;

  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(error, {
      level: context?.level ?? 'error',
      tags: context?.tags,
      extra: context?.extra,
    });
  } catch {
    // Never let monitoring break request handling
  }
}

export async function captureMessage(
  message: string,
  context?: CaptureContext
): Promise<void> {
  if (!hasDsn()) return;

  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(scrubEmailLikeText(message), {
      level: context?.level ?? 'error',
      tags: context?.tags,
      extra: context?.extra
        ? (scrubUnknown(context.extra) as Record<string, unknown>)
        : undefined,
    });
  } catch {
    // Never let monitoring break request handling
  }
}
