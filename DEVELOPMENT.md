# Development Guide

This document contains important development guidelines and lessons learned for the Yomu project.

## Quick Start

1. **Install dependencies**: `npm install`
2. **Set up environment**: Copy `.env.example` to `.env.local` and configure
3. **Initialize database**: `npx prisma db push && npm run db:seed`
4. **Start development**: `npm run dev`

## Code Quality Standards

### Pre-commit Hooks

This project uses automated pre-commit hooks that enforce code quality. Understanding these helps avoid commit failures:

#### Automatic Fixes Applied

- **Trailing whitespace removal**: All trailing spaces/tabs are automatically removed
- **File ending normalization**: Files must end with exactly one newline
- **Prettier formatting**: Code is automatically formatted according to project standards
- **Import sorting**: Import statements are automatically organized

#### Quality Gates

- **ESLint**: All linting errors must be resolved before commit
- **TypeScript**: Code must compile without type errors
- **Tests**: All tests must pass before commit is allowed

### Editor Configuration

**Recommended VS Code settings** (add to `.vscode/settings.json`):

```json
{
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Testing Strategy

### Coverage Goals

- **Current achievement**: ~73% overall coverage
- **Minimum threshold**: 15% (enforced by Jest)
- **Target areas**: Core business logic, user-facing components, API endpoints

### Test Organization

```
__tests__/
├── components/         # UI component tests
├── lib/               # Core library tests
├── pages/             # Page component tests
├── contexts/          # React context tests
├── i18n/              # Internationalization tests
├── accessibility/     # A11y specific tests
└── e2e/              # End-to-end tests
```

### Common Testing Patterns

#### Testing Components with Context

```tsx
// For components using DarkModeContext
import { DarkModeProvider } from "@/contexts/DarkModeContext";

const renderWithProviders = (component) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>);
};
```

#### Testing Async Components

```tsx
import { waitFor } from "@testing-library/react";

it("should display data after loading", async () => {
  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText("Loaded data")).toBeInTheDocument();
  });
});
```

#### Testing Hooks with Dependencies

```tsx
// Use useCallback for stable references
const fetchData = useCallback(async () => {
  // fetch logic here
}, [params.id]); // Only include stable dependencies

useEffect(() => {
  fetchData();
}, [fetchData]);
```

## Framework-Specific Guidelines

### Next.js 15 Updates

#### API Route Parameters

```tsx
// New Promise-based params format
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // ... handle request
}
```

#### Image Optimization

```tsx
// Prefer Next.js Image component over img tags
import Image from "next/image";

<Image src="/path/to/image.jpg" alt="Description" width={100} height={100} />;
```

### React Best Practices

#### Hook Dependencies

- **Always include all dependencies** in useEffect/useCallback dependency arrays
- **Use useCallback** for functions that are dependencies of other hooks
- **Avoid translation functions as dependencies** (they're unstable)

#### Context Usage

- **Wrap test components** with necessary providers
- **Mock contexts** when testing isolated components
- **Use proper error boundaries** for context consumers

## Common Issues and Solutions

### Build/Development Issues

#### 1. "Module not found" errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 2. TypeScript errors after dependency updates

```bash
# Regenerate types
npx prisma generate
npm run build
```

#### 3. Database schema issues

```bash
# Reset database (development only)
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### Test Issues

#### 1. Tests failing after dependency updates

```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

#### 2. Coverage not reflecting new tests

- Check `jest.config.js` `collectCoverageFrom` patterns
- Ensure test files match `testMatch` patterns
- Verify tests are actually running during coverage

#### 3. React hook warnings in tests

- Mock unstable dependencies (translation functions, etc.)
- Use proper provider wrapping
- Ensure cleanup in test teardown

### Deployment Issues

#### 1. Build failures in production

- Run `npm run build` locally to reproduce
- Check for environment variable mismatches
- Verify all dependencies are in `dependencies` (not `devDependencies`)

#### 2. Database migrations

```bash
# Production deployment
npx prisma migrate deploy
```

#### 3. Assets not loading

- Verify public file paths are correct
- Check Next.js static file serving configuration
- Ensure CDN/hosting provider serves static files correctly

## Performance Considerations

### Database

- Use Prisma's `include` and `select` to minimize data fetching
- Implement proper pagination for large datasets
- Monitor query performance with Prisma Studio

### Frontend

- Implement proper loading states
- Use Next.js dynamic imports for code splitting
- Optimize images with Next.js Image component
- Minimize bundle size with tree shaking

### Internationalization

- Keep translation files organized by feature
- Use namespace-based organization for large apps
- Test RTL layout for Hebrew content
- Implement fallback strategies for missing translations

## Security Checklist

- [ ] Environment variables properly configured (no hardcoded secrets)
- [ ] Authentication routes properly protected
- [ ] API endpoints validate user permissions
- [ ] Input validation on all user-facing forms
- [ ] CSRF protection enabled for state-changing operations
- [ ] Database queries use parameterized statements (Prisma handles this)
- [ ] File uploads properly validated and sanitized
- [ ] Error messages don't leak sensitive information

## Monitoring and Debugging

### Development Tools

- **Prisma Studio**: Database GUI for development
- **React Developer Tools**: Component tree inspection
- **Next.js DevTools**: Performance and bundle analysis

### Logging

- Use `console.log` sparingly in production code
- Implement proper error boundaries for React components
- Monitor client-side errors in production

### Performance Monitoring

- Monitor build times and bundle sizes
- Track page load times
- Monitor database query performance
- Set up alerts for error rates

---

**Note**: This guide is updated based on real development experiences. When encountering new issues, document solutions here for future reference.
