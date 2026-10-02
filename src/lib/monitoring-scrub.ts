/**
 * Edge/browser-safe Sentry scrubbing — no Node built-ins.
 * Import from here in sentry.*.config and instrumentation-client.
 */

/**
 * v11 replacement for `sendDefaultPii: false` — restrictive collection.
 * Stricter than Sentry’s published v10-parity snippet: request/response
 * headers and URL query params are fully off so Authorization (cron bearer)
 * and email-bearing query strings never reach telemetry by default.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v10-to-v11/
 */
export const sentryRestrictiveDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: false,
    response: false,
  },
  httpBodies: [] as string[],
  urlQueryParams: false,
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  graphQL: { document: false, variables: false },
} as const;

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
    request?: {
      url?: string;
      query_string?: string | Array<[string, string]> | Record<string, string>;
      headers?: Record<string, string> | Array<[string, string]>;
      [key: string]: unknown;
    };
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

  if (next.request) {
    next.request = scrubRequest(next.request);
  }

  return next;
}

const SENSITIVE_HEADER =
  /^(authorization|cookie|set-cookie|x-api-key|proxy-authorization)$/i;

function scrubRequest<
  T extends {
    url?: string;
    query_string?: string | Array<[string, string]> | Record<string, string>;
    headers?: Record<string, string> | Array<[string, string]>;
    [key: string]: unknown;
  },
>(request: T): T {
  const out = { ...request };

  if (typeof out.url === 'string') {
    out.url = scrubEmailLikeText(stripQueryString(out.url));
  }

  if (typeof out.query_string === 'string') {
    out.query_string = scrubEmailLikeText(out.query_string);
  } else if (Array.isArray(out.query_string)) {
    out.query_string = out.query_string.map(
      ([k, v]) => [k, scrubEmailLikeText(String(v))] as [string, string]
    );
  } else if (out.query_string && typeof out.query_string === 'object') {
    out.query_string = scrubUnknown(out.query_string) as Record<string, string>;
  }

  if (out.headers) {
    out.headers = scrubHeaders(out.headers);
  }

  return out;
}

function stripQueryString(url: string): string {
  const q = url.indexOf('?');
  return q === -1 ? url : url.slice(0, q);
}

function scrubHeaders(
  headers: Record<string, string> | Array<[string, string]>
): Record<string, string> | Array<[string, string]> {
  if (Array.isArray(headers)) {
    return headers.map(([k, v]) =>
      SENSITIVE_HEADER.test(k)
        ? ([k, '[redacted]'] as [string, string])
        : ([k, scrubEmailLikeText(String(v))] as [string, string])
    );
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = SENSITIVE_HEADER.test(k) ? '[redacted]' : scrubEmailLikeText(v);
  }
  return out;
}
