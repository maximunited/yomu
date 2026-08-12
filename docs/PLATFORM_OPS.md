# Platform ops — Sentry, PWA, admin URL audit

## Sentry

- Package: `@sentry/nextjs`
- Init: `src/instrumentation.ts`, `src/instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- React root capture: `src/app/global-error.tsx`
- Helper: `src/lib/monitoring.ts` (`captureException` / `captureMessage`) — no-ops when DSN unset
- `sendDefaultPii: false` + `beforeSend` email scrubbing; webhook duplicate-link events use email hash + Clerk IDs in `extra`, never raw email in message strings
- Wired for Clerk webhook verify/handler failures and `/api/seed` failures
- Env: `SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN` (see `.env.example`)
- Do **not** inject `SENTRY_AUTH_TOKEN` (or Clerk secrets) into `pull_request` CI

## PWA / installability

- Manifest: `public/manifest.webmanifest` (start_url `/dashboard`)
- Icons: `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
- Offline shell: `public/offline.html` + `public/sw.js`
- SW caches shell assets only when `response.ok` (no caching of failed responses)
- Registration: `src/components/ServiceWorkerRegister.tsx` (production, or `NEXT_PUBLIC_ENABLE_PWA=1`)
- Honest scope: shell / offline page only — **not** a full offline catalog

## Admin ops UX (`/admin`)

- Client gate: `GET /api/admin/me` via `requireAdmin()` (role metadata **or** `ADMIN_USER_IDS`) — not metadata-only
- Shows `verified` + `lastChecked` on benefits
- Bulk verify/unverify via `PATCH /api/admin/benefits/bulk` (`requireAdmin`)
- URL audit via `GET|POST /api/admin/url-audit` (`requireAdmin`) against live DB URLs
- Last report persisted in Postgres (`UrlAuditReport` singleton id `latest`) — Vercel-safe (no `.data/` fs)
- Cap: 80 URLs per run by default; brand/benefit URLs interleaved fairly under the limit

All new admin routes stay off the public allowlist in `src/proxy.ts`.
