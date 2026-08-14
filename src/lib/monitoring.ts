/**
 * Thin error-reporting helper. No-ops when Sentry DSN is unset.
 * Prefer this over importing @sentry/nextjs directly in API routes
 * so unit tests stay free of SDK wiring.
 *
 * Scrub helpers live in monitoring-scrub.ts (edge/browser safe).
 */

import { createHash } from 'node:crypto';

import {
  scrubEmailLikeText,
  scrubSentryEvent,
  scrubUnknown,
} from './monitoring-scrub';

export { scrubEmailLikeText, scrubSentryEvent };

type CaptureContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: 'fatal' | 'error' | 'warning' | 'info';
};

function hasDsn(): boolean {
  return Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/** SHA-256 hex prefix of a normalized email — safe for ops correlation. */
export function hashEmailPrefix(email: string, length = 12): string {
  const normalized = email.trim().toLowerCase();
  return createHash('sha256').update(normalized).digest('hex').slice(0, length);
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
