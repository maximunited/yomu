# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development

- `npm run dev` - Start development server with Turbopack (port 3000)
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest unit tests (selective suite for stability)
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests

### Integration Testing

- `npm run test:partnerships` - Test multi-brand partnerships
- `npm run test:api` - Test API endpoints
- `npm run test:translations` - Validate translation completeness
- `npm run test:connection` - Test database connectivity
- `npm run test:docker` - Validate Docker setup

### Database Operations

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate deploy` - Run database migrations
- `npx prisma studio` - Open Prisma Studio GUI
- `npm run db:seed` - Seed database (alias for `node scripts/seed.js`)
- `node scripts/seed.js --mode=fresh` - Wipe and reseed database completely
- `node scripts/seed.js --mode=upsert` - Safe update without wiping data
- `node scripts/seed.js --mode=upsert --brands="Giraffe,Nono & Mimi"` - Seed specific brands only

### Admin Tools

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

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: SQLite (development) with Prisma ORM
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

## Development Workflow

### CRITICAL: Whitespace Prevention Protocol

**MANDATORY BEFORE ANY FILE EDIT:**

1. **Inspect Read output carefully** - Remove ALL trailing spaces from copied text
2. **Verify Edit parameters** - Both `old_string` and `new_string` must have NO trailing whitespace
3. **Check line endings** - Ensure proper newline handling without trailing spaces
4. **Double-check before submit** - Mentally verify no spaces after line content

**Common failure patterns:**

- Copying text from Read output that contains trailing spaces
- Adding spaces after final characters when editing
- Inconsistent tab/space mixing

**Prevention rule: ALWAYS manually strip trailing whitespace from Edit tool parameters**

### Code Quality and Pre-commit Guidelines

**IMPORTANT**: This project uses pre-commit hooks that automatically fix code formatting and run quality checks. Follow these guidelines to prevent commit failures:

#### Pre-commit Hook Rules

- **Trailing Whitespace**: All trailing whitespace is automatically removed
- **End of File**: Files must end with a single newline
- **Prettier Formatting**: Code is automatically formatted according to .prettierrc
- **ESLint**: All linting issues must be resolved
- **TypeScript**: Code must compile without errors
- **Tests**: All tests must pass before commit

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

### UI Components (`src/components/ui/`)

- Reusable components: Button, Input, DarkModeToggle, LanguageSwitcher
- Follow Tailwind CSS patterns with dark mode variants

### Testing

- **Jest Configuration**: Enhanced configuration for improved coverage (73%+)
- **Coverage Targets**: 15% minimum threshold, current achievement ~73%
- **Test Structure**: Unit tests in `__tests__/` directory with category-based organization
- **Coverage Inclusions**: Most source files included, only auth-specific API routes excluded
- **E2E Testing**: Playwright with desktop (Chrome, Firefox, Safari) and mobile (Chrome, Safari) browsers
- **Integration Tests**: Specialized tests for partnerships, API endpoints, translations, and Docker
- **Test Utilities**: Reusable test helpers in `__tests__/utils/test-utils.tsx`
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
