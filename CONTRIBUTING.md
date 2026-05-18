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

# Install the git hook scripts
pre-commit install
pre-commit install --hook-type commit-msg
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

- Keep PRs focused and small
- Include tests for new behavior
- Ensure CI is green (build, tests, audit, docker smoke)

## Code Style

- Follow existing formatting and naming conventions
- Prefer clarity over cleverness

## Security

- Please report vulnerabilities privately to security@yomu.app

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
