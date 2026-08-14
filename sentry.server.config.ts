import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './src/lib/monitoring-scrub';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  sendDefaultPii: false,
  beforeSend(event) {
    return scrubSentryEvent(event as Record<string, unknown>) as typeof event;
  },
});
