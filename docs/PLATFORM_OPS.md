# Platform ops — Sentry, PWA, admin URL audit

## Sentry

- Package: `@sentry/nextjs`
- Init: `src/instrumentation.ts`, `src/instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- React root capture: `src/app/global-error.tsx`
- Helper: `src/lib/monitoring.ts` (`captureException` / `captureMessage`) — no-ops when DSN unset
- Wired for Clerk webhook verify/handler failures and `/api/seed` failures
- Env: `SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN` (see `.env.example`)
- Do **not** inject `SENTRY_AUTH_TOKEN` (or Clerk secrets) into `pull_request` CI

## PWA / installability

- Manifest: `public/manifest.webmanifest` (start_url `/dashboard`)
- Icons: `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
- Offline shell: `public/offline.html` + `public/sw.js`
- Registration: `src/components/ServiceWorkerRegister.tsx` (production, or `NEXT_PUBLIC_ENABLE_PWA=1`)
- Honest scope: shell / offline page only — **not** a full offline catalog

## Admin ops UX (`/admin`)

- Shows `verified` + `lastChecked` on benefits
- Bulk verify/unverify via `PATCH /api/admin/benefits/bulk` (`requireAdmin`)
- URL audit via `GET|POST /api/admin/url-audit` (`requireAdmin`) against live DB URLs
- Last report persisted under `.data/url-audit-last.json` (gitignored)
- Cap: 80 URLs per run by default (serverless-friendly)

All new admin routes stay off the public allowlist in `src/proxy.ts`.
