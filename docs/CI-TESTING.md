# Local CI Testing Guide

This guide explains how to run GitHub Actions CI workflows locally to catch issues before pushing to GitHub.

## 🚀 Quick Start

### Before Every Commit
```bash
npm run ci:quick
```
This runs the essential checks (lint, format, build, tests) in under 2 minutes.

### Before Pushing to GitHub
```bash
npm run ci:simulate
```
This simulates the exact GitHub Actions CI workflow locally.

### Full CI Suite (Optional)
```bash
npm run ci:full
```
This runs all CI checks including Docker tests and security audits.

## 📋 Available CI Commands

| Command | Description | Duration | Use Case |
|---------|-------------|----------|----------|
| `npm run ci:quick` | Essential checks only | ~2 min | Before every commit |
| `npm run ci:simulate` | GitHub Actions simulation | ~5 min | Before pushing |
| `npm run ci:full` | Complete CI suite | ~10 min | Before major releases |
| `npm run ci:test` | Core tests only | ~3 min | Quick validation |
| `npm run ci:docker` | Docker tests only | ~5 min | Container validation |
| `npm run ci:audit` | Security audit only | ~1 min | Security check |

## 🔧 Individual CI Steps

You can also run individual CI steps:

```bash
# Linting
npm run ci:lint

# Build
npm run ci:build

# Unit tests with coverage
npm run ci:test:unit

# Translation checks
npm run ci:test:translations

# Docker tests
npm run ci:docker

# Security audit
npm run ci:audit

# Format check
npm run ci:format:check
```

## 🎯 What Each Script Does

### `ci:quick` - Fast Pre-Commit Check
- ✅ ESLint validation
- ✅ Prettier format check
- ✅ Next.js build
- ✅ Jest unit tests

### `ci:simulate` - GitHub Actions Simulation
- ✅ Checkout simulation
- ✅ Node.js setup verification
- ✅ Dependency installation (`npm ci`)
- ✅ Linting (non-blocking)
- ✅ Type-check and build
- ✅ Jest tests with coverage
- ✅ Translation checks
- ✅ Coverage upload simulation

### `ci:full` - Complete CI Suite
- ✅ All `ci:simulate` steps
- ✅ Docker build and smoke tests
- ✅ Security audit
- ✅ Format validation
- ✅ Detailed reporting

## 🔄 Pre-Commit Integration

The pre-commit hook automatically runs `ci:quick` after lint-staged:

```bash
# This happens automatically on git commit
npx lint-staged && npm run ci:quick
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check for TypeScript errors
   npm run build

   # Check for missing dependencies
   npm ci
   ```

2. **Test Failures**
   ```bash
   # Run tests in watch mode for debugging
   npm run test:watch

   # Run specific test file
   npm test -- tests/unit/pages/dashboard.test.tsx
   ```

3. **Docker Issues**
   ```bash
   # Check Docker is running
   docker --version

   # Clean up Docker containers
   docker system prune -f
   ```

4. **Linting Issues**
   ```bash
   # Auto-fix linting issues
   npm run lint -- --fix

   # Check specific file
   npm run lint -- src/app/dashboard/page.tsx
   ```

### Environment Setup

Make sure you have the required environment variables:

```bash
# Copy environment template
cp .env.example .env.local

# Set required variables
export NODE_ENV=test
export NEXT_TELEMETRY_DISABLED=1
```

## 📊 Understanding CI Results

### Success Indicators
- ✅ All steps show green checkmarks
- 📊 High test coverage (>80%)
- 🚀 Build completes without errors
- 🔒 No security vulnerabilities

### Warning Signs
- ⚠️ Yellow warnings (usually non-blocking)
- 📉 Low test coverage
- 🐌 Slow build times
- 🔍 Linting warnings

### Failure Indicators
- ❌ Red X marks (blocking)
- 💥 Build failures
- 🧪 Test failures
- 🔒 Security vulnerabilities

## 🚀 Best Practices

1. **Run `ci:quick` before every commit**
2. **Run `ci:simulate` before pushing to GitHub**
3. **Fix issues locally before pushing**
4. **Use `ci:full` for major releases**
5. **Check CI logs on GitHub if local tests pass but CI fails**

## 🔧 Customization

### Adding New CI Steps

1. Add the step to `scripts/test-ci-local.js`
2. Add a corresponding npm script in `package.json`
3. Update the workflow in `.github/workflows/ci.yml`

### Modifying Pre-Commit Checks

Edit `.husky/pre-commit` to change what runs before commits.

### Environment-Specific Settings

Create environment-specific configurations in the CI scripts based on `NODE_ENV`.

## E2E Chromium Smoke (PR CI)

PRs and `master` are gated by a **public Chromium-only** Playwright smoke in
`.github/workflows/e2e-chromium-smoke.yml` (not inside `ci.yml`).

| Trigger | When it runs |
| ------- | ------------ |
| `workflow_run` after successful `CI` | Same-repo `pull_request` (posts check **E2E Chromium Smoke** on the PR head SHA) |
| `push` to `master` | Direct smoke on the merged/default branch |

### Why not inside `ci.yml` on `pull_request`?

Clerk’s Next.js middleware requires a **valid** `CLERK_SECRET_KEY` for public
pages to boot (verified: omitting the key or using a dummy `sk_test_…`
placeholder fails handshake / `Missing secretKey`). Injecting
`secrets.CLERK_SECRET_KEY` into a `pull_request` job lets same-repo PR code
(exfiltrate via a malicious `package.json` script, workflow edit, etc.).

`workflow_run` always executes the workflow file from the **default branch**,
so a PR cannot rewrite the secret-handling steps before the smoke runs.
Fork PRs are skipped (`head_repository` must match this repo).

**Amplifier:** never set `E2E_CLERK_USER_EMAIL` on this job. With a secret
present, that env unlocks `global.setup` + `chromium-authenticated`. The
workflow asserts it is unset and that keys are `pk_test_` / `sk_test_`.

### Decision (approaches considered)

| Approach | Pros | Cons | Chosen? |
| -------- | ---- | ---- | ------- |
| `workflow_run` (+ push `master`) with Clerk app secrets, no E2E user | Gates PRs without giving `pull_request` workflows the secret; default-branch workflow definition | Extra workflow; check reported via Checks API; forks skipped | Yes |
| Parallel job in `ci.yml` on `pull_request` with `CLERK_SECRET_KEY` | Simple; visible on PR | Same-repo PR secret exfiltration | No (removed) |
| Omit `CLERK_SECRET_KEY` / dummy placeholder on PR | No secret exposure | App does not boot (Clerk middleware) | No (verified broken) |
| Secret-bearing e2e only on push `master` (no PR gate) | Safest secret posture | Does not gate PRs | No |
| Postgres service + seed + authenticated specs | Deeper coverage | Needs `E2E_CLERK_*`; out of smoke scope | No (local/nightly later) |

**webServer:** keep Playwright’s `npm run dev` (already in `playwright.config.ts`).
CI sets `reuseExistingServer: false`, 120s timeout, `workers: 1`, `retries: 2`.

**Browsers:** under `CI=true`, firefox/webkit/mobile projects are omitted unless
`E2E_FULL_BROWSERS=1` (local/nightly). Authenticated projects still require
`E2E_CLERK_USER_EMAIL` and are **not** set in this smoke.

### Required GitHub Actions secrets

| Secret | Purpose |
| ------ | ------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | App + Clerk UI on public pages (`/sign-in`, redirects) |
| `CLERK_SECRET_KEY` | Server-side Clerk for Next.js middleware |

**MUST** be a dedicated Clerk **development** instance:

- Publishable: `pk_test_…` only (never `pk_live_`)
- Secret: `sk_test_…` only (never `sk_live_`)

The smoke workflow fails closed if either key is missing the `_test_` prefix.
Do **not** put production Clerk keys in GitHub Actions.

Do **not** set `E2E_CLERK_USER_EMAIL` on the smoke job (that enables
`chromium-authenticated` + `global.setup`).

Branch protection: require the check name **E2E Chromium Smoke** (created by
the `workflow_run` job for PRs).

### Local commands

```bash
# Same as CI smoke (chromium public only)
npm run test:e2e:ci

# Explicit chromium project
npm run test:e2e:chromium

# Full multi-browser locally (default when CI unset)
npm run test:e2e

# Nightly-style multi-browser under CI env
CI=true E2E_FULL_BROWSERS=1 npm run test:e2e
```

Install browsers once: `npx playwright install` (CI installs chromium only).

---

- [GitHub Actions Workflows](../.github/workflows/)
- [Jest Testing Guide](./TESTING.md)
- [Docker Setup Guide](./DOCKER.md)
- [Pre-commit Hooks](./PRE-COMMIT.md)

## 🆘 Getting Help

If you encounter issues with local CI testing:

1. Check the troubleshooting section above
2. Review the GitHub Actions logs for comparison
3. Ensure your local environment matches the CI environment
4. Run individual steps to isolate the problem

---

**Remember**: The goal is to catch issues locally before they reach GitHub Actions, saving time and ensuring a smooth CI/CD pipeline! 🎉
