# Birthday benefit reminders

Closes the loop on `UserMembership.remindEnabled`: a daily job creates in-app `Notification` rows (and optional email) when a benefit is about to become Active, or when Active starts.

## Approach

**Vercel Cron → `/api/cron/reminders`** (selected for this Next.js 15 + Prisma + Clerk stack).

| Approach | Pros | Cons |
| -------- | ---- | ---- |
| **Vercel Cron + API (chosen)** | Same deploy as app; Prisma/DB access; Vercel injects `Authorization: Bearer $CRON_SECRET`; tiny surface | Needs Vercel Pro for sub-daily schedules; Hobby = once/day |
| GitHub Action schedule | Familiar ops pattern (like loyalty URL audit) | Needs `DATABASE_URL` + app URL secrets; easy to drift from deploy; not ideal for user DB writes |
| Clerk / email provider alone | Good delivery | No scheduling of benefit windows; still needs a cron + validation logic |

Push / WhatsApp are **not** wired (settings UI toggles only; no half-built sender).

## Behavior

1. Load active memberships with `remindEnabled: true` and brand benefits.
2. Reuse `isBenefitActive` / observed-birthday windows from `src/lib/benefit-validation.ts` via `src/lib/reminders.ts`.
3. If days-until-Active ∈ lead days (default `7,3,1` via `REMINDER_LEAD_DAYS`) → create `reminder_upcoming`.
4. If Active today and `REMINDER_NOTIFY_ON_ACTIVE` is truthy (default) → create `reminder_active`.
5. Dedupe: same `userId` + `benefitId` + `type` on the same local calendar day → skip.
6. Optional email when `RESEND_API_KEY` + `RESEND_FROM_EMAIL` + user email are set.

`remindEnabled: false` memberships are never scanned (`where: { remindEnabled: true }` and a second guard in `collectReminderCandidates`).

## Auth

- Route is on Clerk `PUBLIC_ROUTES` as `/api/cron(.*)` (like webhooks) so Vercel Cron can hit it without a session.
- **GET** (Vercel Cron): `Authorization: Bearer ${CRON_SECRET}` only. No admin cookie fallback (CSRF). Fail closed with **503** if `CRON_SECRET` is unset, **401** if missing/invalid.
- **POST** (manual): Bearer `CRON_SECRET` **or** `requireAdmin()` for signed-in admin runs. If secret unset and not admin → **503**.
- Each future `/api/cron/*` route must define its own gate — Clerk public ≠ authenticated.
- Not listed as a dangerous public allowlist hole for seed/admin — cron secret is mandatory in production.

## Env

| Variable | Required | Meaning |
| -------- | -------- | ------- |
| `CRON_SECRET` | Prod yes | Shared secret; Vercel Cron sends it as Bearer |
| `REMINDER_LEAD_DAYS` | No | Comma list, default `7,3,1` |
| `REMINDER_NOTIFY_ON_ACTIVE` | No | Default on (`1`/`true`); set `0` to disable active-day notices |
| `RESEND_API_KEY` | No | Enables email channel |
| `RESEND_FROM_EMAIL` | No | Verified Resend from address |

## Manual run

```bash
curl -X POST "https://<host>/api/cron/reminders" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Admins can also **POST** while signed in (no Bearer) when debugging. Prefer POST over GET for manual runs.

## Schedule

`vercel.json` cron: `0 6 * * *` (06:00 UTC daily).

## Tests

```bash
npm test -- tests/unit/lib/reminders.test.ts tests/unit/api/cron-reminders.test.ts tests/unit/proxy-public-routes.test.ts
```
