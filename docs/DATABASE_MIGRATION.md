# Database Migration Guide

## SQLite to PostgreSQL Migration (Completed)

This document explains the database migration that occurred in this project.

## Migration Timeline

| Date | Commit | Change |
|------|--------|--------|
| 2026-05-XX | `92d72c3` | Initial migration from SQLite to PostgreSQL |
| 2026-05-XX | `9427d10` | Prisma 7 upgrade with PostgreSQL driver adapter |
| 2026-05-27 | `7051fc7` | Fixed Docker PostgreSQL configuration issues |

## What Changed

### Before Migration
```prisma
datasource db {
  provider = "sqlite"
}
```
```env
DATABASE_URL="file:./dev.db"
```

### After Migration
```prisma
datasource db {
  provider = "postgresql"
}
```
```env
DATABASE_URL="postgresql://yomu:yomu@localhost:5432/yomu"
```

## Why PostgreSQL?

1. **Vercel Deployment**: Vercel does not support SQLite for production deployments
2. **Prisma 7 Compatibility**: Better support and performance optimizations for PostgreSQL
3. **Scalability**: PostgreSQL handles concurrent users and complex queries better
4. **Data Integrity**: ACID compliance and referential integrity enforcement
5. **Production Parity**: Same database in development and production

## Current Database Architecture

### Local Development
- **Docker Compose PostgreSQL** (Recommended)
  - Run: `./scripts/docker-setup.sh start-dev`
  - Automatic setup with persistent volumes
  - URL: `postgresql://yomu:yomu@localhost:5432/yomu`

- **Vercel Postgres (Development Mode)**
  - Run: `vercel env pull .env`
  - Managed PostgreSQL instance
  - URL: Auto-populated from Vercel

- **Manual PostgreSQL Installation**
  - Install PostgreSQL 16+ locally
  - Create database: `createdb yomu`
  - URL: `postgresql://postgres:password@localhost:5432/yomu`

### CI/CD (GitHub Actions)
- **No actual database**
- Uses dummy PostgreSQL URL for build-time environment checks
- Tests use mocked database connections
- URL: `postgresql://yomu:yomu@localhost:5432/yomu` (dummy)

### Production (Vercel)
- **Vercel Postgres** (managed PostgreSQL)
- Provisioned through Vercel Marketplace
- Connection string injected via environment variables
- Automatic connection pooling and scaling

## Orphaned Files

The following files are no longer used and can be safely deleted:

```
prisma/dev.db           # Old SQLite database (184KB)
prisma/dev.db-journal   # SQLite journal file
```

**Why they exist:**
- Legacy files from pre-migration development
- Already in `.gitignore` (won't be committed)
- Safe to delete manually: `rm prisma/dev.db prisma/dev.db-journal`

**Note:** Some developers may still have these files locally. They do not affect the application since Prisma schema no longer supports SQLite.

## Migration Checklist (For Reference)

This migration has already been completed. This checklist is for documentation purposes:

- [x] Update Prisma schema to PostgreSQL provider
- [x] Update `.env.example` with PostgreSQL URL
- [x] Update Docker Compose to use PostgreSQL service
- [x] Update CI/CD workflows with PostgreSQL URLs
- [x] Update all documentation (CLAUDE.md, README.md, DOCKER.md)
- [x] Test migrations with `npx prisma migrate deploy`
- [x] Update backup/restore scripts for PostgreSQL
- [x] Create `.env.local.example` for developers
- [x] Document migration in commit messages

## Developer Onboarding

**For new developers joining the project:**

1. **DO NOT** try to use SQLite - it is no longer supported
2. **DO** follow the PostgreSQL setup in CLAUDE.md
3. **DO** use Docker Compose for the easiest local setup
4. **IGNORE** any `prisma/dev.db` files you see locally

## Troubleshooting

### "SQLite is not supported"
**Problem:** Trying to use old SQLite configuration
**Solution:** Update `DATABASE_URL` to use PostgreSQL format

### "Connection refused on port 5432"
**Problem:** PostgreSQL is not running
**Solution:**
- Docker: `./scripts/docker-setup.sh start-dev`
- Manual: `brew services start postgresql@16` (macOS) or `sudo systemctl start postgresql` (Linux)

### "Database 'yomu' does not exist"
**Problem:** Database not created
**Solution:**
- Docker: `./scripts/docker-setup.sh init-db`
- Manual: `createdb yomu` then `npx prisma db push`

### "Prisma schema does not support sqlite"
**Problem:** Old documentation or cached schema
**Solution:**
1. Run `npx prisma generate` to regenerate client
2. Check `prisma/schema.prisma` - should say `provider = "postgresql"`
3. Update `DATABASE_URL` to PostgreSQL format

## Data Migration (If Needed)

If you have local SQLite data you want to migrate to PostgreSQL:

### Option 1: Export/Import via Seed Script
```bash
# This is the recommended approach
# Your data will be recreated from the seed script
npm run db:seed -- --mode=fresh
```

### Option 2: Manual SQL Export (Advanced)
```bash
# Export SQLite to SQL
sqlite3 prisma/dev.db .dump > backup.sql

# Manually convert SQLite syntax to PostgreSQL syntax
# (This requires manual editing - SQLite and PostgreSQL have different SQL dialects)

# Import to PostgreSQL
psql -U yomu -d yomu < backup-converted.sql
```

**Note:** Option 2 is complex and error-prone. The seed script (Option 1) is recommended.

## References

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Docker Compose for Developers](https://docs.docker.com/compose/)

## Support

If you encounter database issues:
1. Check `CLAUDE.md` for setup instructions
2. Run `./scripts/docker-setup.sh status` to check container health
3. Review logs: `./scripts/docker-setup.sh logs db`
4. Check your `DATABASE_URL` format
