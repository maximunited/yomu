# Catalog ops (drift, URL last-good, seasonal refresh)

YomU’s product catalog source of truth is `scripts/seed.js`. Notion [YomU Loyalty](https://app.notion.com/p/3af88c000814817b9be2eb436202815f) is research tracking only (MCP/UI). Catalog ops scripts do **not** require a Notion token in CI.

## Commands

| Command | What it does | CI default |
| ------- | ------------ | ---------- |
| `npm run catalog:drift` | Structural integrity of seed (brands, benefits, soft list, required URLs). Optional `--db` compares names/titles to Postgres (read-only). | **Blocking** in `ci.yml` (seed only, no DB) |
| `npm run audit:loyalty-urls` | HEAD/GET check of brand `website`, distinct `actionUrl`, and benefit `url`. Optional `--out=loyalty-url-status.json` writes last-good status. | **Non-blocking** monthly (`audit-loyalty-urls.yml`) |
| `npm run catalog:stale` | Seasonal review queue from seed (researched / non-soft benefits). With `--db --stale-days=180` flags verified DB rows with old/missing `lastChecked`. | **Non-blocking** on monthly URL audit workflow |

```bash
# Local structural check (same as CI)
npm run catalog:drift

# Compare seed ↔ live DB (needs DATABASE_URL; never wipes)
npm run catalog:drift -- --db

# URL audit + machine-readable last-good file
npm run audit:loyalty-urls -- --out=loyalty-url-status.json

# Seasonal queue (seed)
npm run catalog:stale

# Stale verified in DB (>180 days); exit 1 only with --fail-on-stale
npm run catalog:stale -- --db --stale-days=180
npm run catalog:stale -- --db --fail-on-stale
```

## Blocking vs non-blocking

- **Blocking:** `catalog:drift` (seed structure). Deterministic, no network, no secrets. Fails CI if seed has duplicate brands, unresolved benefit brand names, missing `website`, or soft-list entries not in `predefinedBrands`. Missing optional `actionUrl` and brands without benefits are **warnings** only.
- **Non-blocking:** URL audit and seasonal queue. External hosts flap (403/429/timeouts); monthly workflow uses `continue-on-error` and uploads `loyalty-url-status` artifact when present.

## Last-good URL status

`loyalty-url-status.json` shape (gitignored):

```json
{
  "checkedAt": "2026-08-13T00:00:00.000Z",
  "source": "audit-loyalty-urls",
  "urls": [
    {
      "kind": "brand|actionUrl|benefit",
      "label": "...",
      "url": "https://...",
      "ok": true,
      "blocked": false,
      "status": 200,
      "lastGoodAt": "2026-08-13T00:00:00.000Z",
      "broken": false
    }
  ]
}
```

Admin UI (`/admin`) surfaces `verified`, `lastChecked`, and links for brand `actionUrl` / benefit `url` from the live DB (after seed upsert).

## Seasonal refresh

- Seed upsert sets `verified: true` + `lastChecked: now` for non-soft brands, and `verified: false` + `lastChecked: null` for `SOFT_BRAND_NAMES`.
- Re-seed alone does **not** prove research is still accurate — use `catalog:stale --db` after ~180 days, or the seed queue as a manual research checklist.
- Soft brands today: H&M, שילב, Shufersal, Isracard, Honigman, Brill Group / Gali, Jump / עונות.

## Safety

- Drift `--db` and stale `--db` are **read-only**.
- Seed wipe rules unchanged: default upsert; refuse `--mode=fresh --brands=`. See `docs/ADMIN_API_SECURITY.md`.
