# Contributing to YomU

Thanks for your interest in contributing!

## Getting Started

- Fork the repo and create your feature branch: `git checkout -b feat/awesome`
- Install deps: `npm install`
- (Optional) Install pre-commit hooks: `pre-commit install` (requires Python)
- Run tests: `npm test`
- Run app: `npm run dev`

### Pre-commit Hooks (Optional)

This project supports [pre-commit](https://pre-commit.com/) for automated code quality checks before commits.

**Installation:**

```bash
# Install pre-commit (requires Python 3.8+)
pip install pre-commit

# Install the git hook scripts (pre-commit, commit-msg, and pre-push)
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit install --hook-type pre-push
```

**What it does:**
- Formats code with Prettier
- Lints with ESLint
- Validates commit messages (Conventional Commits)
- Checks for secrets, trailing whitespace, merge conflicts
- Runs type checking and tests on pre-push

**Manual run:**

```bash
# Run on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run
```

**Note:** The project already uses Husky + lint-staged for similar functionality. Pre-commit is optional but provides additional checks like secret detection.

## Commit Messages

- Use Conventional Commits (e.g., `feat: add X`, `fix: correct Y`, `docs: update Z`)
- Use `npm run commit` (Commitizen) for a guided commit flow

## Pull Requests

### Before Creating a PR

**1. Run Pre-flight Checks:**
```bash
# Quick check (required)
npm run ci:quick

# Full simulation (recommended)
npm run ci:simulate

# Optional: Full CI suite
npm run ci:full
```

**2. Test Coverage Requirements:**
- Maintain or improve existing coverage (currently ~73%)
- Minimum threshold: 15% (enforced by Jest)
- Add tests for:
  - New features (unit + integration)
  - Bug fixes (regression tests)
  - API endpoints (request/response tests)
  - UI components (rendering + interaction)

**3. Code Quality Checklist:**
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] TypeScript compiles with no errors
- [ ] No new console.log statements (use proper logging)
- [ ] No hardcoded secrets or credentials
- [ ] All imports are used (no unused imports)

### Creating the PR

**PR Title Format:**
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add birthday benefit notification system
fix: resolve authentication redirect loop
docs: update PostgreSQL setup instructions
chore: upgrade Next.js to 15.1.0
test: add E2E tests for membership flow
refactor: simplify benefit validation logic
```

**PR Description Template:**
```markdown
## Summary
Brief description of what this PR does and why.

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] All CI checks pass

## Screenshots (if UI changes)
[Add screenshots here]

## Breaking Changes
[List any breaking changes, or write "None"]

## Related Issues
Closes #123
Related to #456
```

### PR Size Guidelines

**Keep PRs focused and reviewable:**
- ✅ **Small** (< 200 lines): Ideal, quick to review
- ⚠️ **Medium** (200-500 lines): Acceptable, provide context
- ❌ **Large** (> 500 lines): Split into multiple PRs when possible

**Exceptions to size limits:**
- Generated code (Prisma migrations, translations)
- Documentation updates
- Dependency updates

### CI Requirements

**All PRs must pass:**
1. **GitHub Actions CI** (`.github/workflows/ci.yml`)
   - ✅ Linting (non-blocking, but fix warnings)
   - ✅ Build succeeds
   - ✅ Unit tests pass
   - ✅ Translation checks pass
   - ✅ Coverage uploaded to Coveralls

2. **Docker Build** (`.github/workflows/docker.yml`)
   - ✅ Docker image builds successfully
   - ✅ Container starts without errors

3. **Security Audit** (`.github/workflows/audit.yml`)
   - ✅ No critical or high vulnerabilities
   - ⚠️ Medium/low vulnerabilities need review

### Review Process

**1. Self-Review:**
Before requesting review, check:
- [ ] Read your own diff on GitHub
- [ ] Remove debug code and console.logs
- [ ] Update relevant documentation
- [ ] Add/update tests
- [ ] Verify CI checks pass

**2. Reviewer Guidelines:**
Reviewers will check for:
- Code correctness and logic
- Test coverage and quality
- Security considerations
- Performance implications
- Code style and consistency
- Documentation completeness

**3. Addressing Feedback:**
- Respond to all comments (even if just "Fixed")
- Push additional commits (don't force push)
- Re-request review after changes
- Resolve conversations when addressed

### Merging

**Merge Requirements:**
- ✅ At least 1 approval (for non-trivial PRs)
- ✅ All CI checks green
- ✅ No merge conflicts
- ✅ Branch up-to-date with master

**Merge Strategy:**
- Use **"Squash and Merge"** for feature branches
- Use **"Rebase and Merge"** for docs-only changes
- **Never** use "Create a merge commit" (creates messy history)

**After Merge:**
- Delete the branch (GitHub will prompt)
- Verify deployment on Vercel
- Monitor for errors in production

### Special PR Types

**Documentation PRs:**
- Can be merged faster (less risky)
- Still require CI to pass
- Focus on clarity and accuracy

**Dependency Updates:**
- Run `npm audit` to check for vulnerabilities
- Test thoroughly (dependencies can break things)
- Update lockfile (`package-lock.json`)

**Database Schema Changes:**
- Create Prisma migration: `npx prisma migrate dev`
- Test migration on fresh database
- Document migration in PR description
- Consider backward compatibility

**Breaking Changes:**
- Label PR with `breaking-change`
- Document migration path in PR description
- Update CHANGELOG.md
- Consider deprecation period

## Code Style

- Follow existing formatting and naming conventions
- Prefer clarity over cleverness

## Security

- Please report vulnerabilities privately to security@yomu.app

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
