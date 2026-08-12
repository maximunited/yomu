# Admin API security contracts

Locks Aug 12 RBAC / dangerous-route hardening with Jest regression tests (no Clerk E2E secrets).

## Gates

| Layer | Behavior |
| ----- | -------- |
| `src/proxy.ts` `PUBLIC_ROUTES` | Seed/setup/test-\*/admin are **not** public; Clerk `auth.protect()` applies |
| `src/lib/admin-auth.ts` `requireAdmin()` | No session → **401**; signed-in non-admin → **403**; admin via `publicMetadata.role === 'admin'` or `ADMIN_USER_IDS` |
| `/api/seed` | Admin **and** `ALLOW_API_SEED=1` (exact); prefer CLI `node scripts/seed.js --mode=upsert` |
| `scripts/seed.js` | Defaults to upsert; refuses `--mode=fresh --brands=`; wipe only when `mode === 'fresh'` |

## Running the contract suite

```bash
npm test -- tests/unit/lib/admin-auth.test.ts \
  tests/unit/api/seed-security.test.ts \
  tests/unit/api/setup-security.test.ts \
  tests/unit/proxy-public-routes.test.ts \
  tests/unit/scripts/seed-safety.test.ts \
  tests/unit/api/admin-benefits.test.ts \
  tests/unit/api/test-prisma.test.ts \
  tests/unit/api/test-users.test.ts
```

Auth is mocked (`@clerk/nextjs/server` or `requireAdmin`). Playwright is not required for these contracts.

## Local admin access

1. Set Clerk `publicMetadata.role` to `"admin"` for your user, **or**
2. Set `ADMIN_USER_IDS=user_xxx` (comma-separated Clerk user ids).

Never put seed/setup/test routes back on the public allowlist.

## Admin ops routes (platform enhancements)

| Route | Gate | Purpose |
| ----- | ---- | ------- |
| `GET /api/admin/me` | `requireAdmin` | Client admin probe (`{ ok: true }`) |
| `PATCH /api/admin/benefits/bulk` | `requireAdmin` | Bulk set `verified` + `lastChecked` |
| `GET/POST /api/admin/url-audit` | `requireAdmin` | Read last / run DB URL audit (Postgres) |

See `docs/PLATFORM_OPS.md`.

## Related: reminders cron

Daily benefit reminders use `/api/cron/reminders` (Clerk-public like webhooks):

| Method | Gate |
| ------ | ---- |
| **GET** | `CRON_SECRET` Bearer only (no admin cookie — CSRF) |
| **POST** | `CRON_SECRET` Bearer **or** `requireAdmin()` |

See [REMINDERS.md](./REMINDERS.md).
