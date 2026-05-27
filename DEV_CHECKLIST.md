# Developer Checklist

Quick reference for common development tasks. For detailed guides, see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Full contribution guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development best practices
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [docs/CI-TESTING.md](docs/CI-TESTING.md) - CI/CD testing guide

---

## 🚀 Daily Development Workflow

### Starting Work

```bash
# 1. Pull latest changes
git checkout master
git pull origin master

# 2. Create feature branch
git checkout -b feat/your-feature-name

# 3. Start development environment
npm run dev                          # Local dev (if PostgreSQL running)
# OR
./scripts/docker-setup.sh start-dev  # Docker dev (includes PostgreSQL)

# 4. Open in browser
# http://localhost:3000 (local) or http://localhost:3001 (Docker)
```

### During Development

```bash
# Run tests while coding (watch mode)
npm run test:watch

# Check types
npx tsc --noEmit

# Lint files
npm run lint

# Format code
npm run format
```

---

## ✅ Pre-Commit Checklist

**Automatic (Husky hooks will run):**
- ✅ Trailing whitespace removed
- ✅ Files end with newline
- ✅ Prettier formatting applied
- ✅ ESLint fixes applied
- ✅ Related tests run
- ✅ Quick CI check runs

**Manual checks before committing:**
- [ ] Remove debug code (`console.log`, `debugger`)
- [ ] Update tests if needed
- [ ] Update documentation if needed
- [ ] No hardcoded secrets
- [ ] TypeScript compiles: `npm run build`

---

## 📝 Committing Code

### Option A: Commitizen (Recommended)

```bash
git add .
npm run commit  # Guided commit message
```

### Option B: Manual Conventional Commit

```bash
git add .
git commit -m "feat: add birthday notification system"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Adding/fixing tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `style:` - Formatting changes
- `perf:` - Performance improvements

---

## 🔍 Pre-Push Checklist

**Run before pushing:**
```bash
# Quick validation (2 min)
npm run ci:quick

# Full simulation (5 min) - Recommended
npm run ci:simulate
```

**Verify:**
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Coverage maintained/improved

---

## 🔀 Creating a Pull Request

### Step 1: Pre-flight Checks

```bash
# 1. Ensure branch is up-to-date
git checkout master
git pull origin master
git checkout your-feature-branch
git rebase master

# 2. Run full CI suite
npm run ci:full

# 3. Push branch
git push -u origin your-feature-branch
```

### Step 2: Create PR

```bash
# Using GitHub CLI
gh pr create --title "feat: your feature title" --body "PR description"

# Or via GitHub web interface
# https://github.com/maximunited/yomu/compare
```

### Step 3: PR Description Checklist

- [ ] Clear title (Conventional Commits format)
- [ ] Summary of changes
- [ ] Testing performed
- [ ] Screenshots (if UI changes)
- [ ] Breaking changes documented
- [ ] Related issues linked

---

## 🧪 Testing Checklist

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/components/Button.test.tsx

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Coverage Targets:**
- Overall: 73%+ (current achievement)
- Minimum: 15% (enforced threshold)

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Run specific test suite
npm run test:e2e:auth
npm run test:e2e:dashboard
npm run test:e2e:dark-mode

# Debug mode (step through)
npm run test:e2e:debug

# Mobile viewports only
npm run test:e2e:mobile

# Accessibility tests
npm run test:e2e:accessibility
```

### Integration Tests

```bash
# API tests
npm run test:api

# Partnership tests
npm run test:partnerships

# Translation completeness
npm run test:translations

# Database connectivity
npm run test:connection

# Docker setup
npm run test:docker
```

---

## 🐛 Debugging Checklist

### Common Issues

**1. Build Errors**
```bash
rm -rf .next          # Clear Next.js cache
npm run build         # Rebuild
```

**2. Database Issues**
```bash
npx prisma generate   # Regenerate Prisma client
npx prisma db push    # Sync schema
npm run db:seed       # Reseed database
```

**3. Test Failures**
```bash
npm test -- --clearCache  # Clear Jest cache
```

**4. Type Errors**
```bash
npx prisma generate   # Regenerate types
npm run build         # Check TypeScript compilation
```

**5. Port Already in Use**
```bash
# Find process using port 3000
lsof -ti:3000         # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>         # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

---

## 🗄️ Database Operations

### Common Tasks

```bash
# View database (GUI)
npx prisma studio

# Regenerate Prisma client
npx prisma generate

# Sync schema to database (dev only)
npx prisma db push

# Create migration
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npm run db:seed

# Fresh seed (wipe and recreate)
npm run db:seed -- --mode=fresh

# Safe seed (update existing)
npm run db:seed -- --mode=upsert

# Seed specific brands
npm run db:seed -- --brands="Giraffe,Fox"
```

### Docker PostgreSQL

```bash
# Start PostgreSQL
./scripts/docker-setup.sh start-dev

# Initialize database
./scripts/docker-setup.sh init-db

# Backup database
./scripts/docker-setup.sh backup

# Restore database
./scripts/docker-setup.sh restore ./backups/backup_file.sql

# View logs
./scripts/docker-setup.sh logs db

# Check status
./scripts/docker-setup.sh status
```

---

## 🏗️ Build & Deploy Checklist

### Local Build Test

```bash
# Production build
npm run build

# Start production server
npm start

# Access at http://localhost:3000
```

### Environment Variables

**Required for all environments:**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>
```

**Optional:**
```env
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
```

**Generate secret:**
```bash
openssl rand -base64 32
```

---

## 📚 Documentation Updates

**When to update docs:**
- [ ] New feature → Update README.md
- [ ] API changes → Update CLAUDE.md
- [ ] Architecture changes → Update docs/ARCHITECTURE.md
- [ ] Setup changes → Update QUICKSTART.md
- [ ] Breaking changes → Update CHANGELOG.md

**Documentation locations:**
```
README.md              - Project overview & quick start
CLAUDE.md              - Complete development guide
QUICKSTART.md          - 5-minute setup guide
CONTRIBUTING.md        - Contribution guidelines
DEVELOPMENT.md         - Best practices
docs/ARCHITECTURE.md   - System architecture
docs/CI-TESTING.md     - CI/CD guide
docs/DOCKER.md         - Docker setup
```

---

## 🔒 Security Checklist

**Before committing:**
- [ ] No secrets in code (API keys, passwords)
- [ ] No sensitive data in logs
- [ ] Environment variables properly configured
- [ ] User input validated
- [ ] SQL injection prevented (use Prisma)
- [ ] XSS prevented (React escapes by default)
- [ ] Authentication required for protected routes
- [ ] Authorization checked for user-specific data

**Check for secrets:**
```bash
# Scan for potential secrets
git diff --staged | grep -i "api_key\|secret\|password"
```

---

## 🚢 Release Checklist

**Before merging to master:**
- [ ] All CI checks pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Breaking changes documented
- [ ] Migration guide created (if needed)
- [ ] Version bumped (if applicable)

**After merge:**
- [ ] Monitor Vercel deployment
- [ ] Check production logs for errors
- [ ] Verify database migrations applied
- [ ] Test critical user flows
- [ ] Announce changes (if major release)

---

## 🆘 Quick Help

**Common Commands:**
```bash
npm run dev              # Start dev server
npm test                 # Run unit tests
npm run build            # Production build
npm run lint             # Check linting
npm run format           # Format code
npm run ci:quick         # Quick CI check
npm run db:seed          # Seed database
npx prisma studio        # Database GUI
```

**Get Help:**
- 📖 Read [CLAUDE.md](CLAUDE.md) for detailed guides
- 🏗️ Check [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture
- 🐛 See [DEVELOPMENT.md](DEVELOPMENT.md) for common issues
- 💬 Ask in GitHub Discussions
- 🐞 Report bugs in GitHub Issues

---

## 📊 Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| Overall   | 75%+   | ~73%    |
| Core Lib  | 90%+   | High    |
| UI Components | 80%+ | Good    |
| API Routes | 70%+  | Good    |
| Pages     | 60%+   | Good    |

**Check coverage:**
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

**Last Updated:** 2026-05-27
**For detailed information, always refer to the full documentation files.**
