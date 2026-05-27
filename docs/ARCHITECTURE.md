# YomU System Architecture

This document provides a comprehensive overview of YomU's architecture across all environments: local development, CI/CD, and production (Vercel).

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Three-Environment Architecture](#three-environment-architecture)
- [Application Architecture](#application-architecture)
- [Database Architecture](#database-architecture)
- [Authentication Flow](#authentication-flow)
- [Deployment Pipeline](#deployment-pipeline)
- [Performance Considerations](#performance-considerations)
- [Security Architecture](#security-architecture)

---

## Overview

YomU is a Next.js 15 application designed for mobile-first birthday benefits aggregation. The architecture supports three distinct environments:

| Environment | Purpose | Database | Deployment |
|------------|---------|----------|------------|
| **Local** | Development & Testing | PostgreSQL (Docker/Vercel/Manual) | `npm run dev` |
| **CI/CD** | Automated Testing | None (mocked) | GitHub Actions |
| **Production** | Live Application | Vercel Postgres | Automatic via Vercel |

---

## Technology Stack

### Frontend

```
┌─────────────────────────────────┐
│   Next.js 15 (App Router)       │
│   ├── React 19                  │
│   ├── TypeScript 5.x            │
│   ├── Tailwind CSS 4.x          │
│   └── Lucide React (icons)      │
└─────────────────────────────────┘
```

**Key Features:**
- Server Components by default
- Client Components where needed (`use client`)
- Streaming SSR with Suspense
- Automatic code splitting
- Built-in Image optimization

### Backend

```
┌─────────────────────────────────┐
│   Next.js API Routes            │
│   ├── Server Actions            │
│   ├── Route Handlers (REST)     │
│   ├── Middleware (auth)         │
│   └── Edge Runtime (optional)   │
└─────────────────────────────────┘
```

**Runtime:**
- Node.js 22.14.0+ (specified in `.nvmrc`)
- Turbopack for development (fast refresh)
- SWC for production builds

### Database Layer

```
┌─────────────────────────────────┐
│   Prisma 7 ORM                  │
│   ├── PostgreSQL Driver         │
│   ├── Type-safe Client          │
│   ├── Schema Migrations         │
│   └── Introspection Tools       │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   PostgreSQL 16                 │
│   ├── Relational Data           │
│   ├── ACID Transactions         │
│   ├── Indexes & Constraints     │
│   └── Connection Pooling        │
└─────────────────────────────────┘
```

### Authentication

```
┌─────────────────────────────────┐
│   NextAuth.js v4                │
│   ├── Email/Password            │
│   ├── Google OAuth              │
│   ├── JWT Sessions              │
│   └── Database Adapter          │
└─────────────────────────────────┘
```

### Testing Stack

```
┌─────────────────────────────────┐
│   Jest (Unit Tests)             │
│   ├── React Testing Library     │
│   ├── Coverage: ~73%            │
│   └── 71 test suites, 255 tests │
└─────────────────────────────────┘
         +
┌─────────────────────────────────┐
│   Playwright (E2E Tests)        │
│   ├── Multi-browser             │
│   ├── Mobile viewports          │
│   └── Accessibility tests       │
└─────────────────────────────────┘
```

### Code Quality

```
┌─────────────────────────────────┐
│   ESLint + Prettier             │
│   ├── Husky (Git Hooks)         │
│   ├── lint-staged               │
│   ├── Commitizen                │
│   └── Conventional Commits      │
└─────────────────────────────────┘
```

---

## Three-Environment Architecture

### 1. Local Development Environment

```
┌──────────────────────────────────────────┐
│  Developer Machine                       │
│  ┌────────────────────────────────────┐ │
│  │  Next.js Dev Server (Port 3000)    │ │
│  │  ├── Hot Module Reload             │ │
│  │  ├── Turbopack                     │ │
│  │  └── Source Maps                   │ │
│  └────────────────────────────────────┘ │
│              ↓                           │
│  ┌────────────────────────────────────┐ │
│  │  PostgreSQL (3 Options)            │ │
│  │  ├── Docker Compose (recommended)  │ │
│  │  ├── Vercel Postgres (dev mode)    │ │
│  │  └── Manual Installation           │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Setup Options:**

**Option A: Docker Compose (Recommended)**
```bash
./scripts/docker-setup.sh start-dev
# PostgreSQL runs in container
# App runs in container on port 3001
# Database persists in Docker volume
```

**Option B: Vercel Postgres**
```bash
vercel link
vercel env pull .env
npm run dev
# PostgreSQL on Vercel infrastructure
# App runs locally on port 3000
```

**Option C: Manual PostgreSQL**
```bash
# Install PostgreSQL 16+ locally
npm run dev
# PostgreSQL on localhost:5432
# App runs locally on port 3000
```

**Environment Variables (`.env.local`):**
```env
DATABASE_URL=postgresql://yomu:yomu@localhost:5432/yomu
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-key
NODE_ENV=development
```

---

### 2. CI/CD Environment (GitHub Actions)

```
┌──────────────────────────────────────────┐
│  GitHub Actions Runner (Ubuntu)          │
│  ┌────────────────────────────────────┐ │
│  │  Workflow: .github/workflows/ci.yml│ │
│  │                                    │ │
│  │  1. Checkout Code                  │ │
│  │  2. Setup Node.js (from .nvmrc)    │ │
│  │  3. Install Dependencies (npm ci)  │ │
│  │  4. Lint (non-blocking)            │ │
│  │  5. Build (with dummy DB URL)      │ │
│  │  6. Run Jest Tests (mocked DB)     │ │
│  │  7. Translation Checks             │ │
│  │  8. Upload Coverage to Coveralls   │ │
│  └────────────────────────────────────┘ │
│              ↓                           │
│  ┌────────────────────────────────────┐ │
│  │  No Real Database                  │ │
│  │  ├── Dummy PostgreSQL URL          │ │
│  │  ├── DATABASE_URL for build only   │ │
│  │  └── SKIP_DB_PUSH=true             │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**CI Environment Variables:**
```env
DATABASE_URL=postgresql://yomu:yomu@localhost:5432/yomu  # Dummy
NEXTAUTH_URL=http://localhost:3000                      # Dummy
SKIP_DB_PUSH=true                                       # Critical
NEXT_TELEMETRY_DISABLED=1
CI=true
```

**Key Points:**
- No actual database connection
- Tests use mocked Prisma client
- Build verification only (no runtime tests)
- Runs on every push to `master` and all PRs

**Workflow Triggers:**
```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

---

### 3. Production Environment (Vercel)

```
┌──────────────────────────────────────────────────────┐
│  Vercel Global Edge Network                          │
│  ┌────────────────────────────────────────────────┐ │
│  │  Next.js Production Build                      │ │
│  │  ├── Static Pages (pre-rendered)               │ │
│  │  ├── Server Components (on-demand)             │ │
│  │  ├── API Routes (serverless functions)         │ │
│  │  └── Edge Middleware (global)                  │ │
│  └────────────────────────────────────────────────┘ │
│              ↓                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  Vercel Postgres (Managed)                     │ │
│  │  ├── Connection Pooling                        │ │
│  │  ├── Automatic Backups                         │ │
│  │  ├── High Availability                         │ │
│  │  └── SSL/TLS Encryption                        │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Deployment Flow:**
```
Git Push → GitHub → Vercel Webhook → Build → Deploy
                                       ↓
                              1. npm install
                              2. npx prisma generate
                              3. npm run build
                              4. npx prisma migrate deploy
                              5. Deploy to Edge Network
```

**Environment Variables (Vercel Dashboard):**
```env
DATABASE_URL=postgres://...vercel-storage.com:5432/verceldb?sslmode=require
NEXTAUTH_URL=https://yomu.vercel.app
NEXTAUTH_SECRET=<production-secret-from-vercel>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
NODE_ENV=production
```

**Production Features:**
- Automatic HTTPS (SSL certificates)
- Global CDN for static assets
- Serverless function cold starts < 50ms
- Database connection pooling
- Automatic Preview Deployments (PRs)

---

## Application Architecture

### Directory Structure

```
src/
├── app/                      # Next.js 15 App Router
│   ├── (auth)/              # Auth route group
│   │   ├── signin/
│   │   └── signup/
│   ├── api/                 # API Routes
│   │   ├── auth/[...nextauth]/
│   │   ├── benefits/
│   │   ├── brands/
│   │   ├── memberships/
│   │   └── users/
│   ├── dashboard/           # Dashboard page
│   ├── admin/               # Admin panel
│   ├── memberships/         # Membership management
│   ├── settings/            # User settings
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React Components
│   ├── ui/                  # Reusable UI components
│   └── providers/           # Context providers
├── contexts/                # React Contexts
│   ├── DarkModeContext.tsx
│   └── LanguageContext.tsx
├── lib/                     # Core Utilities
│   ├── auth.ts              # NextAuth configuration
│   ├── benefit-validation.ts
│   ├── prisma.ts            # Prisma client
│   └── utils.ts
├── types/                   # TypeScript types
└── i18n/                    # Internationalization
    └── messages.ts
```

### Data Flow Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ↓
┌──────────────────────────┐
│  Next.js Server          │
│  ┌────────────────────┐  │
│  │  Middleware        │  │ ← Authentication check
│  └────────┬───────────┘  │
│           ↓              │
│  ┌────────────────────┐  │
│  │  Route Handler     │  │ ← API endpoint
│  │  or Page Component │  │
│  └────────┬───────────┘  │
│           ↓              │
│  ┌────────────────────┐  │
│  │  Prisma Client     │  │ ← ORM query builder
│  └────────┬───────────┘  │
└───────────┼──────────────┘
            │ SQL Query
            ↓
┌───────────────────────────┐
│  PostgreSQL Database      │
└───────────────────────────┘
```

### Component Architecture

**Server Components (Default):**
```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  // Can directly access database
  const benefits = await prisma.benefit.findMany();
  return <BenefitsList benefits={benefits} />;
}
```

**Client Components (Interactive):**
```tsx
// src/components/ui/DarkModeToggle.tsx
'use client';
export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return <button onClick={toggleDarkMode}>Toggle</button>;
}
```

---

## Database Architecture

### Schema Overview

```
User
 ├─── Account (OAuth accounts)
 ├─── Session (active sessions)
 ├─── UserMembership (brand memberships)
 ├─── CustomMembership (user-created)
 ├─── Notification (benefit reminders)
 └─── UsedBenefit (redemption tracking)

Brand
 ├─── Benefit (birthday perks)
 ├─── BrandPartnership (co-branded)
 └─── UserMembership (members)

CustomMembership
 └─── CustomBenefit (user-defined perks)
```

### Key Relationships

```
User ──< UserMembership >── Brand
User ──< CustomMembership >──< CustomBenefit
Brand ──< Benefit
Brand ──< BrandPartnership >── Brand
User ──< UsedBenefit >── Benefit
```

### Migration Strategy

**Development:**
```bash
npx prisma db push  # Prototype schema changes
```

**Production:**
```bash
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply to production
```

**Seeding:**
```bash
npm run db:seed -- --mode=fresh   # Wipe and recreate
npm run db:seed -- --mode=upsert  # Safe update
```

---

## Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Visit /auth/signin
     ↓
┌────────────────────────┐
│  NextAuth.js           │
│  ├── Email/Password    │ → bcrypt hash verification
│  └── Google OAuth      │ → OAuth 2.0 flow
└────┬───────────────────┘
     │ 2. Create session
     ↓
┌────────────────────────┐
│  Database              │
│  ├── Create Session    │
│  ├── Update User       │
│  └── Store in Cookie   │
└────┬───────────────────┘
     │ 3. Redirect to dashboard
     ↓
┌────────────────────────┐
│  Protected Routes      │
│  ├── Check JWT token   │
│  ├── Verify session    │
│  └── Render page       │
└────────────────────────┘
```

**Session Management:**
- JWT tokens stored in HTTP-only cookies
- 30-day expiration (configurable)
- Automatic refresh on activity
- Secure flag in production (HTTPS only)

---

## Deployment Pipeline

### Local → GitHub → Vercel Flow

```
Developer
   │ git push
   ↓
GitHub Repository
   │ webhook
   ↓
┌─────────────────────────┐
│  GitHub Actions (CI)    │
│  ├── Lint               │
│  ├── Build              │
│  ├── Test               │
│  └── Coverage           │
└────┬────────────────────┘
     │ ✓ CI Passed
     ↓
┌─────────────────────────┐
│  Vercel Build           │
│  ├── Install deps       │
│  ├── Prisma generate    │
│  ├── Next.js build      │
│  ├── Prisma migrate     │
│  └── Deploy to Edge     │
└────┬────────────────────┘
     │ Deployment URL
     ↓
Production (https://yomu.vercel.app)
```

### Branch-based Deployments

| Branch | Deployment Type | URL | Database |
|--------|----------------|-----|----------|
| `master` | Production | `yomu.vercel.app` | Production DB |
| PR branches | Preview | `yomu-git-<branch>.vercel.app` | Separate preview DB |
| Other | None | - | - |

### Deployment Checks

**Pre-deployment (GitHub Actions):**
- ✅ Linting passes
- ✅ Build succeeds
- ✅ Tests pass (>15% coverage)
- ✅ No critical vulnerabilities

**Deployment (Vercel):**
- ✅ Dependencies install
- ✅ Prisma client generates
- ✅ Next.js builds without errors
- ✅ Database migrations apply cleanly

---

## Performance Considerations

### Database Optimization

```typescript
// Good: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
});

// Bad: Fetch all fields and relations
const users = await prisma.user.findMany({
  include: { sessions: true, accounts: true }
});
```

### Caching Strategy

```
┌────────────────────────┐
│  Static Pages          │ ← Built at deploy time
│  ├── Homepage          │   Cached forever
│  └── About             │
└────────────────────────┘

┌────────────────────────┐
│  Dynamic Pages         │ ← Server-rendered on request
│  ├── Dashboard         │   No caching (user-specific)
│  └── Admin             │
└────────────────────────┘

┌────────────────────────┐
│  API Routes            │ ← Serverless functions
│  ├── /api/benefits     │   No caching (real-time)
│  └── /api/brands       │
└────────────────────────┘
```

### Bundle Optimization

```bash
# Production build statistics
npm run build

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          87 kB
├ ○ /dashboard                           8.1 kB          95 kB
├ ○ /admin                              12.4 kB         102 kB
└ ○ /api/benefits                        0 kB            82 kB

# Target: First Load JS < 100 kB per route
```

---

## Security Architecture

### Layers of Security

```
┌────────────────────────────────────┐
│  1. Network Layer                  │
│     ├── HTTPS (TLS 1.3)            │
│     ├── HSTS Headers               │
│     └── DDoS Protection (Vercel)   │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  2. Application Layer              │
│     ├── CSRF Protection            │
│     ├── XSS Prevention             │
│     ├── SQL Injection (Prisma ORM) │
│     └── Rate Limiting              │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  3. Authentication Layer           │
│     ├── bcrypt Password Hashing    │
│     ├── JWT Token Validation       │
│     ├── OAuth 2.0 (Google)         │
│     └── Session Management         │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  4. Data Layer                     │
│     ├── Encrypted Connections      │
│     ├── Parameterized Queries      │
│     ├── Database Backups           │
│     └── Access Control             │
└────────────────────────────────────┘
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Environment Variable Security

```
┌──────────────────────────────────┐
│  Never Commit:                   │
│  ├── .env (local secrets)        │
│  ├── .env.local (overrides)      │
│  └── .env.production (prod keys) │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Safe to Commit:                 │
│  ├── .env.example (template)     │
│  └── .env.local.example (guide)  │
└──────────────────────────────────┘
```

---

## Monitoring & Observability

### What We Monitor

**Production:**
- Response times (Vercel Analytics)
- Error rates (Next.js error boundaries)
- Database query performance (Prisma)
- API endpoint usage

**Development:**
- Build times
- Test coverage (Coveralls)
- Bundle sizes
- Dependency vulnerabilities (npm audit)

### Logging Strategy

```typescript
// Production: Minimal logging
console.error('Critical error:', error); // Only errors

// Development: Verbose logging
console.log('Debug info:', data); // OK for debugging
```

---

## Scaling Considerations

### Current Architecture Supports:

- ✅ Thousands of concurrent users (Vercel serverless)
- ✅ Multi-region deployment (Vercel Edge Network)
- ✅ Database connection pooling (Vercel Postgres)
- ✅ Automatic scaling (serverless functions)

### Future Optimizations:

- 🔄 Redis caching for frequently accessed data
- 🔄 CDN for user-uploaded images
- 🔄 Background job processing (webhooks)
- 🔄 GraphQL API layer (optional)

---

## Related Documentation

- [QUICKSTART.md](../QUICKSTART.md) - Fast setup guide
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guidelines
- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Database details
- [CI-TESTING.md](./CI-TESTING.md) - Local CI testing
- [DOCKER.md](./DOCKER.md) - Docker setup

---

**Last Updated:** 2026-05-27  
**Architecture Version:** 2.0 (Post-PostgreSQL Migration)
