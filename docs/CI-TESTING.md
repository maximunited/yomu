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

## 📚 Related Documentation

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
