# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YomU** (יום-You) is a mobile-first birthday benefits platform that aggregates personal birthday deals and freebies for users in Israel. The application helps users track membership-based birthday benefits from Israeli brands.

## Development Commands

### Build and Development

- `npm run dev` - Start development server with Turbopack (port 3000)
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without modifying files
- `npm run test` - Run Jest unit tests from tests/unit/ directory
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm test -- path/to/test.test.tsx` - Run a specific test file
- `npm run test:e2e` - Run Playwright end-to-end tests from tests/e2e/ directory
- `npm run test:e2e:headed` - Run E2E tests with visible browser
- `npm run test:e2e:debug` - Run E2E tests in debug mode (step-by-step)
- `npm run test:e2e:mobile` - Run E2E tests on mobile viewports only
- `npm run test:e2e:accessibility` - Run accessibility-specific E2E tests
- `npm run test:e2e:auth` - Run authentication E2E tests only
- `npm run test:e2e:dashboard` - Run dashboard E2E tests only
- `npm run test:e2e:dark-mode` - Run dark mode E2E tests only
- `npm run test:e2e:report` - View Playwright test report

### Integration Testing

- `npm run test:partnerships` - Test multi-brand partnerships (tests/integration/)
- `npm run test:api` - Test API endpoints (tests/integration/api/)
- `npm run test:translations` - Validate translation completeness (tests/integration/)
- `npm run test:connection` - Test database connectivity (tests/integration/)
- `npm run test:docker` - Validate Docker setup

### Database Operations

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate deploy` - Run database migrations
- `npx prisma studio` - Open Prisma Studio GUI (visual database browser)
- `npm run db:studio` - Alias for Prisma Studio
- `npm run db:seed` - Seed database (alias for `node scripts/seed.js`)
- `node scripts/seed.js --mode=fresh` - Wipe and reseed database completely
- `node scripts/seed.js --mode=upsert` - Safe update without wiping data
- `node scripts/seed.js --mode=upsert --brands="Giraffe,Nono & Mimi"` - Seed specific brands only

### Admin Tools

**Admin Dashboard UI:**
- Access at `/admin` route (e.g., `http://localhost:3000/admin`)
- Provides web interface for brand and benefit management
- **Requires authentication**: Redirects to `/auth/signin` if not logged in
- ⚠️ **Production**: Consider adding role-based access control (currently any authenticated user can access admin)

**Command-Line Admin Tools:**
- `npm run admin:help` - Show admin helper script usage
- `node scripts/admin-helper.js list-brands` - List all brands
- `node scripts/admin-helper.js export-brands` - Export brands to JSON
- `node scripts/admin-helper.js import-brands brands.json` - Import brands from JSON
- `node scripts/admin-helper.js toggle-brand <brand-id>` - Toggle brand status
- `npm run assets:brands` - Download brand logos from web

### Docker Commands

- `./scripts/docker-setup.sh setup` - Initial Docker setup
- `./scripts/docker-setup.sh start` - Start production containers
- `./scripts/docker-setup.sh start-dev` - Start development containers
- `./scripts/docker-setup.sh init-db` - Initialize database in containers

### Git and Commit Tools

- `npm run commit` - Interactive commit with Commitizen (conventional commits)
- `npm run lint:commits` - Validate commit messages (last 20 commits)

### CI/Testing Locally

- `npm run ci:test` - Run full CI test suite (lint, build, unit tests, translations)
- `npm run ci:quick` - Quick CI check
- `npm run ci:full` - Full local CI simulation
- `npm run ci:docker` - Test Docker setup
- `npm run ci:audit` - Run security audit
- `npm run ci:format:check` - Check code formatting for CI

## Project Structure

This project follows modern industry standards for file organization. The project directory name is "yomu":

```text
yomu/
├── src/                        # Source code
│   ├── app/                    # Next.js App Router pages and API routes
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   └── providers/          # Context providers
│   ├── contexts/               # React context definitions
│   ├── lib/                    # Utility functions and configurations
│   ├── types/                  # TypeScript type definitions
│   └── i18n/                   # Internationalization files
├── tests/                      # All test files
│   ├── unit/                   # Unit tests (Jest)
│   │   ├── components/         # Component tests
│   │   ├── lib/                # Library function tests
│   │   ├── pages/              # Page component tests
│   │   ├── contexts/           # Context tests
│   │   └── i18n/               # Translation tests
│   ├── integration/            # Integration tests
│   │   └── api/                # API endpoint tests
│   ├── e2e/                    # End-to-end tests (Playwright)
│   └── utils/                  # Test utilities and helpers
├── scripts/                    # Build and deployment scripts
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
├── docs/                       # Documentation
└── [config files]             # Jest, ESLint, Playwright, etc.
```

### Test Organization

**Directory Structure:**
```
tests/
├── unit/          # Jest unit tests (71 suites, 255 tests)
├── integration/   # Integration tests (Node.js scripts, not Jest)
├── e2e/           # Playwright end-to-end tests
├── api/           # API integration tests (standalone scripts)
└── utils/         # Shared test helpers and utilities
```

- **Unit Tests**: `tests/unit/` - Fast, isolated tests for individual components and functions (run with `npm test`)
- **Integration Tests**: `tests/integration/` - Node.js scripts that verify components working together (run with `npm run test:partnerships`, `npm run test:translations`, etc.)
- **E2E Tests**: `tests/e2e/` - Full application workflow tests with Playwright (run with `npm run test:e2e`)
- **API Tests**: `tests/api/` - Standalone API integration tests (run with `npm run test:api`)
- **Test Utils**: `tests/utils/` - Shared test helpers and utilities (not tests themselves)

### Key Directories

- **src/app/**: Next.js 15 App Router structure with nested layouts and API routes
- **src/components/**: Reusable React components with proper separation of UI and business logic
- **src/lib/**: Core utilities including auth, database, translations, and validation logic
- **scripts/**: Database seeding, admin tools, and deployment scripts
- **prisma/**: Database schema, migrations, and development database

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: SQLite (development) with Prisma ORM
  - ⚠️ **Production Warning**: SQLite is for development only. For production, switch to PostgreSQL or MySQL by updating the Prisma schema and `DATABASE_URL` in `.env`
- **Authentication**: NextAuth.js with Google OAuth and email/password
- **Styling**: Tailwind CSS with dark mode support
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Internationalization**: Hebrew/English with RTL support

### Core Models (Prisma Schema)

- **User**: Authentication, profile data including dateOfBirth and optional anniversaryDate
- **Brand**: Companies offering benefits (name, logoUrl, category, actionUrl for deep linking)
- **Benefit**: Birthday benefits with validity types and redemption methods
- **UserMembership**: Links users to brands they're members of
- **CustomMembership**: User-created memberships with custom benefits
- **CustomBenefit**: Benefits linked to custom memberships
- **Notification**: System notifications for benefits
- **UsedBenefit**: Tracking of redeemed benefits to prevent duplicate use
- **BrandPartnership**: Many-to-many relationships between brands for co-branded benefits
- **Account/Session**: NextAuth.js authentication models

### Key Architecture Patterns

#### Benefit Validation System

The application has a sophisticated benefit validation system in `src/lib/benefit-validation.ts`:

- **Validity Types**: `birthday_exact_date`, `birthday_entire_month`, `birthday_week_before_after`, etc.
- **Validation Logic**: Functions to determine if benefits are active for a user's birthday
- **Legacy Support**: Handles older validity type names for backward compatibility

#### Context Providers

Multiple React contexts provide global state:

- **DarkModeContext**: Global dark mode with localStorage persistence
- **LanguageContext**: Hebrew/English switching with RTL support
- **SessionProvider**: NextAuth.js session management

#### Dashboard Logic

The dashboard (`src/app/dashboard/page.tsx`) categorizes benefits:

- **Active Benefits**: Currently valid based on user's birthday and validity rules
- **Upcoming Benefits**: Will be active soon
- **Membership Filtering**: Only shows benefits for user's active memberships

### Important Development Notes

#### Benefit Validity Types

When working with benefits, always use the validation functions from `src/lib/benefit-validation.ts`:

- Use `isBenefitActive()` to check if a benefit is currently valid
- Use `getUpcomingBenefits()` to determine upcoming benefits
- Refer to `docs/BENEFITS_SPECIFICATION.md` for detailed validity type documentation

#### Authentication Flow

- Custom email/password registration in `/auth/signup`
- Google OAuth integration
- JWT sessions with 30-day expiration
- User profiles require dateOfBirth for benefit calculations
- Optional anniversaryDate field for anniversary benefits

#### Internationalization

- All user-facing text should support Hebrew and English
- Use the `useLanguage()` hook and `t()` function for translations
- Hebrew is RTL, English is LTR - ensure UI components handle both

#### Database Seeding

- **Primary Script**: `scripts/seed.js` with mode-based operation
- **Fresh Mode**: `--mode=fresh` wipes existing data and creates new (use for clean installs)
- **Upsert Mode**: `--mode=upsert` safely updates without data loss (use for production updates)
- **Brand Filtering**: `--brands="Brand1,Brand2"` parameter for selective seeding
- **Validation**: Ensures all benefits follow the specification in `docs/BENEFITS_SPECIFICATION.md`
- **Partnership Support**: Automatically creates brand partnerships and co-branded benefits

## Initial Setup

### Environment Variables

Create a `.env` file in the project root with the following required variables:

```env
# Database
DATABASE_URL=file:./dev.db

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth (optional, for Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Required for basic functionality:**
- `DATABASE_URL`: SQLite database path (use `file:./dev.db` for local development)
- `NEXTAUTH_URL`: The base URL of your application
- `NEXTAUTH_SECRET`: Secret key for JWT encryption (generate with `openssl rand -base64 32`)

**Optional:**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Only needed if enabling Google OAuth

### First-Time Setup

1. Install dependencies: `npm install`
2. Create `.env` file with the required variables above
3. Generate Prisma client: `npx prisma generate`
4. Initialize database: `npx prisma db push`
5. Seed the database: `npm run db:seed`
6. Start dev server: `npm run dev`

## Development Workflow

### Code Quality and Pre-commit Guidelines

**IMPORTANT**: This project uses pre-commit hooks that automatically fix code formatting and run quality checks. Follow these guidelines to prevent commit failures:

#### Pre-commit Hook Rules

This project uses Husky + lint-staged to automatically enforce code quality on commit. When you commit, the following happens automatically:

- **Trailing Whitespace**: All trailing whitespace is automatically removed
- **End of File**: Files must end with a single newline
- **Prettier Formatting**: Code is automatically formatted according to .prettierrc (2 spaces, single quotes, semicolons)
- **ESLint**: Linting issues are auto-fixed where possible; unfixable issues block the commit
- **TypeScript**: Code must compile without errors
- **Tests**: Related tests run automatically for changed files (`--findRelatedTests`)

**What lint-staged does:**
- Runs only on staged files (fast and efficient)
- Applies ESLint fixes and Prettier formatting
- Runs tests related to the changed files
- Automatically adds formatting changes back to the commit
- Blocks commit if tests fail or unfixable issues exist

#### Before Making Changes

1. **Clean trailing whitespace**: Use your editor's "trim trailing whitespace" feature
2. **Ensure proper file endings**: Files should end with a newline
3. **Run linting**: `npm run lint` to catch issues early
4. **Verify tests pass**: `npm run test` for unit tests

#### Common Issue Prevention

- **React Hook Dependencies**: Always include all dependencies in useEffect/useCallback dependency arrays
- **Translation Keys**: When testing translation functions, use the actual values from the translation files
- **Provider Wrapping**: Page components using contexts (DarkMode, Language) need proper test providers
- **API Route Parameters**: Next.js 15 uses Promise-based params: `{ params: Promise<{ id: string }> }`

#### Running Tests Before Commits

```bash
npm run lint          # Fix linting issues
npm run test          # Run unit tests
npm run test:coverage # Check coverage improvements
npm run test:e2e      # Run end-to-end tests (optional but recommended)
```

#### Commit Process

1. Stage changes: `git add .`
2. Commit: `git commit -m "message"`
3. Pre-commit hooks will automatically run and may modify files
4. If hooks make changes, they're automatically included in the commit
5. Push: `git push`

### Working with Benefits

When creating or modifying benefits, always:

1. Use validation functions from `src/lib/benefit-validation.ts`
2. Refer to `docs/BENEFITS_SPECIFICATION.md` for validity types
3. Test with different user birthdays to ensure correct behavior
4. Validate that `isBenefitActive()` returns expected results

### Database Changes

When modifying the Prisma schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma generate` to update the client
3. Run `npx prisma db push` to apply changes (development)
4. Test with `npm run test:connection`
5. Reseed if needed: `npm run db:seed`

### Adding New Languages

1. Add translations to `src/i18n/messages.ts`
2. Update language list in `src/lib/languages.ts`
3. Test RTL behavior for Arabic/Hebrew
4. Run `npm run test:translations` to validate completeness

## File Structure Notes

### API Routes (`src/app/api/`)

- RESTful endpoints for benefits, brands, users, and memberships
- Authentication middleware protects user-specific endpoints
- Validation using Prisma and custom validation functions

**IMPORTANT - Next.js 15 API Route Format:**
Next.js 15 uses Promise-based params. Always use this pattern:

```typescript
// ✅ Correct - Next.js 15 format
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... use id
}

// ❌ Wrong - Old Next.js format (will cause TypeScript errors)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... params.id
}
```

### UI Components (`src/components/ui/`)

- Reusable components: Button, Input, DarkModeToggle, LanguageSwitcher
- Follow Tailwind CSS patterns with dark mode variants

### Testing

- **Jest Configuration**: Enhanced configuration for improved coverage (73%+)
- **Coverage Targets**: 15% minimum threshold, current achievement ~73%
- **Test Structure**: Unit tests in `tests/unit/` directory with category-based organization
- **Coverage Inclusions**: Most source files included, only auth-specific API routes excluded
- **E2E Testing**: Playwright with desktop (Chrome, Firefox, Safari) and mobile (Chrome, Safari) browsers
- **Integration Tests**: Specialized tests for partnerships, API endpoints, translations, and Docker
- **Test Utilities**: Reusable test helpers in `tests/utils/test-helpers.tsx`
- **Accessibility Testing**: Dedicated accessibility tests for key components

#### Test Coverage Strategy

- **Core Libraries**: lib/auth.ts, lib/benefit-validation.ts, lib/utils.ts heavily tested
- **Page Components**: Comprehensive tests for home, settings, onboarding, demo, memberships
- **UI Components**: Complete coverage for reusable components in components/ui/
- **Context Providers**: DarkModeContext, LanguageContext tested with multiple scenarios
- **API Endpoints**: Most user-facing endpoints tested (auth-specific routes excluded)

#### Test Writing Guidelines

- **Component Tests**: Use proper provider wrapping for components using contexts
- **Hook Dependencies**: Mock useEffect dependencies correctly to prevent infinite loops
- **Translation Testing**: Use actual translation values, not hardcoded expectations
- **Async Testing**: Use waitFor() for components with loading states
- **Provider Identification**: Use 'id' field for NextAuth providers, not 'name'

#### Running Specific Tests

**Jest (Unit Tests):**
```bash
# Run a specific test file
npm test -- tests/unit/lib/benefit-validation.test.ts

# Run all tests matching a pattern
npm test -- --testPathPattern="DarkMode"

# Run tests in watch mode for specific file
npm run test:watch -- tests/unit/components/ui/Button.test.tsx
```

**Playwright (E2E Tests):**
```bash
# Run a specific E2E test file
npx playwright test tests/e2e/auth.spec.ts

# Run a specific test by name
npx playwright test -g "should login successfully"

# Run tests for a specific project (browser)
npx playwright test --project="chromium"
```

### Docker Support

- Multi-stage Dockerfile for production builds
- Docker Compose with development and production profiles
- SQLite database with persistent volumes
- Supports both Docker and Podman

## Troubleshooting Common Issues

### Test Failures

#### "useDarkMode must be used within a DarkModeProvider"

**Problem**: Page components using `useDarkMode` hook fail in tests
**Solution**: Wrap test components with proper providers or mock the hook

```tsx
// Mock the hook in test files
jest.mock("@/contexts/DarkModeContext", () => ({
  useDarkMode: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
}));
```

#### "Maximum update depth exceeded" / React Infinite Loop

**Problem**: useEffect dependencies cause infinite re-renders
**Solution**: Use useCallback for stable function references

```tsx
// Bad - causes infinite loop
useEffect(() => {
  fetchData();
}, [t]); // translation function is unstable

// Good - stable reference
const fetchData = useCallback(async () => {
  // fetch logic
}, [params.id]); // only stable dependencies
```

#### "Cannot read properties of undefined (reading 'authorize')"

**Problem**: NextAuth provider not found in tests
**Solution**: Use 'id' field instead of 'name' to find providers

```tsx
// Bad
const provider = authOptions.providers.find((p) => p.name === "credentials");

// Good
const provider = authOptions.providers.find((p) => p.id === "credentials");
```

### Pre-commit Hook Failures

#### Trailing Whitespace

**Problem**: `trim trailing whitespace.....Failed`
**Solution**: Configure your editor to remove trailing whitespace on save, or run:

```bash
# Manual fix (project-wide)
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's/[[:space:]]*$//'
```

#### End of File Issues

**Problem**: `fix end of files.....Failed`
**Solution**: Ensure files end with exactly one newline character

#### Prettier Formatting

**Problem**: `prettier.....Failed`
**Solution**: Run Prettier before committing:

```bash
npm run format  # or npx prettier --write .
```

### Coverage Issues

#### Low Coverage on Existing Files

**Problem**: Files showing 0% coverage despite having tests
**Solution**: Check Jest configuration - ensure files are included in `collectCoverageFrom`

#### Tests Not Running

**Problem**: Tests exist but aren't executed during coverage
**Solution**: Verify `testMatch` patterns in jest.config.js include your test files

### Next.js 15 API Routes

#### Parameter Type Errors

**Problem**: API route params cause TypeScript errors
**Solution**: Use Promise-based params format:

```tsx
// Old Next.js format
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

// Next.js 15 format
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```
