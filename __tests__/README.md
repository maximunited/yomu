# Testing Guide

This document provides a comprehensive guide to the testing setup for the YomU birthday benefits app.

## Overview

The testing setup includes:

- **Unit Tests**: Jest + React Testing Library for component and utility testing
- **Integration Tests**: API route testing with mocked dependencies
- **End-to-End Tests**: Playwright for full browser testing
- **Test Utilities**: Shared mocks and helpers

## Test Structure

```text
__tests__/
├── api/                    # API route tests
│   ├── benefits.test.ts
│   └── user/
│       └── profile.test.ts
├── components/             # Component tests
│   └── ui/
│       ├── Button.test.tsx
│       └── Input.test.tsx
├── lib/                    # Utility function tests
│   └── benefit-validation.test.ts
├── pages/                  # Page integration tests
│   └── dashboard.test.tsx
├── e2e/                    # End-to-end tests
│   └── dashboard.spec.ts
├── utils/                  # Test utilities
│   └── test-utils.tsx
└── README.md              # This file
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- __tests__/api/benefits.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="Button"
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test dashboard.spec.ts

# Run E2E tests in headed mode
npx playwright test --headed

# Run E2E tests in debug mode
npx playwright test --debug
```

## Test Categories

### 1. Unit Tests

Unit tests focus on individual functions and components in isolation.

**Examples:**

- Component rendering with different props
- Utility function behavior
- Form validation logic
- Date calculations

**Location:** `__tests__/components/`, `__tests__/lib/`

### 2. Integration Tests

Integration tests verify that different parts of the application work together correctly.

**Examples:**

- API route handling
- Database operations
- Authentication flow
- Component interactions

**Location:** `__tests__/api/`, `__tests__/pages/`

### 3. End-to-End Tests

E2E tests simulate real user interactions across the entire application.

**Examples:**

- User registration and login
- Dashboard navigation
- Benefit browsing and redemption
- Responsive design testing

**Location:** `__tests__/e2e/`

## Testing Patterns

### Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('should handle click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Route Testing

```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/benefits/route'

describe('/api/benefits', () => {
  it('should return benefits when authenticated', async () => {
    // Mock dependencies
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1' },
    })
    
    const request = new NextRequest('http://localhost:3000/api/benefits')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.benefits).toBeDefined()
  })
})
```

### E2E Testing

```typescript
import { test, expect } from '@playwright/test'

test('should display dashboard elements', async ({ page }) => {
  await page.goto('/dashboard')
  
  await expect(page.getByText('ברוכים הבאים')).toBeVisible()
  await expect(page.getByText('הטבות פעילות')).toBeVisible()
})
```

## Mocking Strategy

### API Mocks

```typescript
// Mock fetch responses
global.fetch = jest.fn()
  .mockResolvedValueOnce({
    ok: true,
    json: async () => ({ user: mockUser }),
  })
```

### Authentication Mocks

```typescript
// Mock NextAuth session
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: mockUser },
    status: 'authenticated',
  })),
}))
```

### Database Mocks

```typescript
// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    benefit: { findMany: jest.fn() },
  },
}))
```

## Test Utilities

### Custom Render Function

```typescript
import { render } from '@/__tests__/utils/test-utils'

// Includes all providers automatically
render(<MyComponent />)
```

### Mock Data

```typescript
import { mockUser, mockBenefit, mockBrand } from '@/__tests__/utils/test-utils'

// Use consistent mock data across tests
```

### Setup Helpers

```typescript
import { setupMockFetch, setupMockSession } from '@/__tests__/utils/test-utils'

beforeEach(() => {
  setupMockFetch()
  setupMockSession()
})
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Mocking

- Mock at the right level (API calls, not implementation details)
- Use consistent mock data across tests
- Clean up mocks between tests

### 3. Assertions

- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Avoid testing library internals

### 4. Async Testing

- Use `waitFor` for asynchronous operations
- Handle loading states in tests
- Test error scenarios

### 5. Accessibility

- Test keyboard navigation
- Verify ARIA labels and roles
- Ensure screen reader compatibility

## Coverage Goals

- **Unit Tests**: 80%+ coverage for utility functions
- **Component Tests**: 90%+ coverage for UI components
- **Integration Tests**: 70%+ coverage for API routes
- **E2E Tests**: Critical user journeys

## Debugging Tests

### Jest Debugging

```bash
# Run tests in debug mode
npm test -- --detectOpenHandles

# Run specific test with console output
npm test -- --verbose
```

### Playwright Debugging

```bash
# Run with browser open
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Show test traces
npx playwright show-trace
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are set up before component render
2. **Async test failures**: Use `waitFor` for async operations
3. **E2E timeouts**: Increase timeout or check for loading states
4. **TypeScript errors**: Ensure test files use `.test.ts` or `.test.tsx` extension

### Performance Tips

- Use `beforeAll` for expensive setup
- Mock heavy dependencies
- Run tests in parallel when possible
- Use test data factories for complex objects

## Contributing

When adding new tests:

1. Follow the existing patterns and structure
2. Use the provided test utilities
3. Add appropriate mocks for external dependencies
4. Include both positive and negative test cases
5. Update this documentation if needed
