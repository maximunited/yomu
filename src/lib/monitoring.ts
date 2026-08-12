/**
 * Thin error-reporting helper. No-ops when Sentry DSN is unset.
 * Prefer this over importing @sentry/nextjs directly in API routes
 * so unit tests stay free of SDK wiring.
 */

type CaptureContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: 'fatal' | 'error' | 'warning' | 'info';
};

function hasDsn(): boolean {
  return Boolean(
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  );
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
    Sentry.captureMessage(message, {
      level: context?.level ?? 'error',
      tags: context?.tags,
      extra: context?.extra,
    });
  } catch {
    // Never let monitoring break request handling
  }
}
