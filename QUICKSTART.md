# YomU Quick Start Guide

Get YomU running locally in 5 minutes.

## Prerequisites

- Node.js 22.14.0 or higher ([install nvm](https://github.com/nvm-sh/nvm))
- Docker Desktop ([install Docker](https://www.docker.com/products/docker-desktop)) **OR** PostgreSQL 16+

## Option A: Docker Compose (Easiest)

**Best for:** First-time setup, no PostgreSQL installation needed

```bash
# 1. Clone and install
git clone <repo-url> yomu
cd yomu
npm install

# 2. Setup and start (one command does it all)
./scripts/docker-setup.sh setup
./scripts/docker-setup.sh start-dev
./scripts/docker-setup.sh init-db

# 3. Open browser
# http://localhost:3001
```

**That's it!** PostgreSQL, app, and sample data are all running.

### Docker Commands Reference
```bash
./scripts/docker-setup.sh status      # Check if running
./scripts/docker-setup.sh stop        # Stop all services
./scripts/docker-setup.sh logs app    # View app logs
./scripts/docker-setup.sh logs db     # View database logs
```

---

## Option B: Vercel Postgres (No Docker)

**Best for:** Developers already using Vercel

```bash
# 1. Clone and install
git clone <repo-url> yomu
cd yomu
npm install

# 2. Link to Vercel and pull environment
npm i -g vercel
vercel link
vercel env pull .env

# 3. Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Start dev server
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

## Option C: Manual PostgreSQL (Advanced)

**Best for:** Developers who prefer manual control

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb yomu
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create dedicated user for YomU (choose your own password)
sudo -u postgres psql << EOF
CREATE USER yomu WITH PASSWORD 'your-secure-password-here';
CREATE DATABASE yomu OWNER yomu;
GRANT ALL PRIVILEGES ON DATABASE yomu TO yomu;
EOF
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings (port 5432)
- Create database `yomu` using pgAdmin or:
```cmd
psql -U postgres -c "CREATE DATABASE yomu;"
```

### Step 2: Setup Application

```bash
# 1. Clone and install
git clone <repo-url> yomu
cd yomu
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and update DATABASE_URL:
# DATABASE_URL="postgresql://yomu:your-secure-password-here@localhost:5432/yomu"

# 4. Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Start dev server
npm run dev

# 6. Open browser
# http://localhost:3000
```

---

## Verify Installation

After starting the app, you should see:

1. **Homepage** at `http://localhost:3000` (or 3001 for Docker)
2. **Login page** at `/auth/signin`
3. **Admin panel** at `/admin` (after logging in)

### Test User (Created by Seed Script)

```
Email: demo@example.com
Password: demo123
```

Or create a new account via `/auth/signup`

---

## Common Issues

### "DATABASE_URL not set"
**Solution:** Create `.env` file with `DATABASE_URL=postgresql://...`

### "Cannot connect to database"
**Docker:** Run `./scripts/docker-setup.sh status` - db should be "healthy"
**Manual:** Check PostgreSQL is running: `pg_isready`

### "Prisma Client not generated"
**Solution:** Run `npx prisma generate`

### "Database schema is out of sync"
**Solution:** Run `npx prisma db push`

### Port 3000 already in use
**Docker:** Use port 3001 instead (default for dev mode)
**Manual:** Change `NEXTAUTH_URL` in `.env` to `http://localhost:3001` and run `npm run dev -- -p 3001`

---

## Next Steps

After successful setup:

1. **Explore the app:**
   - Browse benefits at `/dashboard`
   - Add memberships at `/memberships`
   - Manage brands at `/admin`

2. **Read documentation:**
   - `CLAUDE.md` - Full development guide
   - `docs/BENEFITS_SPECIFICATION.md` - How benefits work
   - `docs/DATABASE_MIGRATION.md` - Database architecture

3. **Run tests:**
   ```bash
   npm test                 # Unit tests
   npm run test:e2e         # End-to-end tests
   npm run test:coverage    # Coverage report
   ```

4. **Make changes:**
   ```bash
   npm run dev              # Start dev server with hot reload
   npm run lint             # Check code quality
   npm run format           # Format code
   git commit               # Pre-commit hooks auto-fix issues
   ```

---

## Database Management

### View Database (GUI)
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Reseed Database
```bash
# Wipe and recreate all data
npm run db:seed -- --mode=fresh

# Update existing data (safe)
npm run db:seed -- --mode=upsert
```

### Backup Database (Docker)
```bash
./scripts/docker-setup.sh backup
# Saves to: ./backups/backup_YYYYMMDD_HHMMSS.sql
```

### Restore Database (Docker)
```bash
./scripts/docker-setup.sh restore ./backups/backup_20260527_120000.sql
```

---

## Getting Help

- **Documentation:** See `CLAUDE.md` for detailed guides
- **Issues:** Check existing issues or create a new one
- **Logs:**
  - Docker: `./scripts/docker-setup.sh logs app`
  - Manual: Check terminal where `npm run dev` is running

---

## Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit code ...

# 3. Test changes
npm run lint
npm test
npm run test:e2e

# 4. Commit (uses Commitizen)
npm run commit

# 5. Push and create PR
git push -u origin feature/my-feature
```

Pre-commit hooks will automatically:
- Format code with Prettier
- Fix ESLint issues
- Run related tests
- Remove trailing whitespace

---

**Happy coding!** 🎉
