import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from '@/lib/monitoring';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  tracesSampleRate: Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1
  ),
  sendDefaultPii: false,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend(event) {
    return scrubSentryEvent(event as Record<string, unknown>) as typeof event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
