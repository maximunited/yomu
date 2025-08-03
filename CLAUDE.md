# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development

- `npm run dev` - Start development server with Turbopack (port 3000)
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests

### Database Operations

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate deploy` - Run database migrations
- `npx prisma studio` - Open Prisma Studio GUI
- `node scripts/seed.js` - Seed database with basic data
- `node scripts/seed-with-validation.js` - Seed with comprehensive validation
- `node scripts/seed-comprehensive.js` - Seed with full dataset

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
- **Brand**: Companies offering benefits (name, logoUrl, category)
- **Benefit**: Birthday benefits with validity types and redemption methods
- **UserMembership**: Links users to brands they're members of
- **CustomMembership**: User-created memberships
- **Notification**: System notifications for benefits

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

- Use `scripts/seed-with-validation.js` for production-like data
- Validation ensures all benefits follow the specification
- Includes comprehensive error reporting for invalid data

## File Structure Notes

### API Routes (`src/app/api/`)

- RESTful endpoints for benefits, brands, users, and memberships
- Authentication middleware protects user-specific endpoints
- Validation using Prisma and custom validation functions

### UI Components (`src/components/ui/`)

- Reusable components: Button, Input, DarkModeToggle, LanguageSwitcher
- Follow Tailwind CSS patterns with dark mode variants

### Testing

- Unit tests in `__tests__/` directory
- E2E tests use Playwright with mobile and desktop browser testing
- Test utilities in `__tests__/utils/test-utils.tsx`

### Docker Support

- Multi-stage Dockerfile for production builds
- Docker Compose with development and production profiles
- SQLite database with persistent volumes
- Supports both Docker and Podman
