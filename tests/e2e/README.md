# End-to-End (E2E) Tests

This directory contains comprehensive end-to-end tests for the YomU application using Playwright.

## Overview

The E2E tests cover:

- **Authentication flows** - Sign in, sign up, and authentication states
- **Homepage and navigation** - Main landing page, navigation menus, and routing
- **Dashboard functionality** - User dashboard, benefits display, and interactions
- **Memberships management** - Brand memberships, toggles, and custom memberships
- **Benefit usage** - Benefit details, redemption, and tracking
- **Accessibility** - ARIA compliance, keyboard navigation, and screen reader support
- **Mobile responsiveness** - Touch interfaces, responsive design, and mobile-specific features

## Test Structure

```
tests/e2e/
├── fixtures/
│   └── test-data.ts          # Test data constants and mock objects
├── helpers/
│   ├── auth-helpers.ts       # Authentication helper functions
│   └── page-helpers.ts       # Common page interaction helpers
├── screenshots/              # Screenshots captured during test failures
├── auth.spec.ts             # Authentication flow tests
├── homepage.spec.ts         # Homepage and navigation tests
├── dashboard.spec.ts        # Dashboard functionality tests
├── memberships.spec.ts      # Memberships management tests
├── benefits.spec.ts         # Benefit usage and detail tests
├── accessibility.spec.ts    # Accessibility compliance tests
├── mobile.spec.ts          # Mobile responsiveness tests
└── README.md               # This file
```

## Available Commands

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with browser UI visible
npm run test:e2e:headed

# Run tests in debug mode (step-by-step)
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### Specific Test Suites

```bash
# Run only authentication tests
npm run test:e2e:auth

# Run only dashboard tests
npm run test:e2e:dashboard

# Run only accessibility tests
npm run test:e2e:accessibility

# Run only mobile tests
npm run test:e2e:mobile
```

### Browser-Specific Testing

```bash
# Run on mobile browsers only
npm run test:e2e:mobile

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

Tests are configured in `playwright.config.ts` with:

- **Multiple browsers**: Chromium, Firefox, WebKit
- **Mobile testing**: iPhone 12, Pixel 5 viewports
- **Automatic retries**: 2 retries on CI, 0 locally
- **Screenshots**: Captured on test failures
- **Video recording**: Retained on failures
- **Test reports**: HTML reports with detailed results

## Test Data and Fixtures

Test data is centralized in `fixtures/test-data.ts`:

```typescript
export const testUsers = {
  validUser: {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    dateOfBirth: "1990-07-15",
  },
};

export const urls = {
  home: "/",
  signin: "/auth/signin",
  dashboard: "/dashboard",
  // ... more URLs
};
```

## Helper Functions

### Authentication Helper

```typescript
const authHelper = new AuthHelper(page);

// Sign in with test credentials
await authHelper.signIn();

// Sign up with test data
await authHelper.signUp();

// Check authentication status
const isAuth = await authHelper.isAuthenticated();

// Clear authentication state
await authHelper.clearAuth();
```

### Page Helper

```typescript
const pageHelper = new PageHelper(page);

// Wait for complete page load
await pageHelper.waitForPageLoad();

// Check accessibility compliance
await pageHelper.checkAccessibility();

// Test responsive design
await pageHelper.checkResponsiveDesign();

// Take debugging screenshot
await pageHelper.takeScreenshot("debug-screenshot");
```

## Test Philosophy

### Resilient Testing

Tests are designed to be resilient and handle various scenarios:

- **Graceful degradation**: Tests check if elements exist before interacting
- **Multiple selectors**: Tests use multiple CSS selectors to find elements
- **Conditional logic**: Tests adapt to different authentication states
- **Timeout handling**: Appropriate timeouts for different operations

### Real-World Scenarios

Tests simulate real user behavior:

- **Progressive enhancement**: Tests work with and without JavaScript
- **Network conditions**: Tests handle slow loading and network errors
- **Device diversity**: Tests cover desktop, tablet, and mobile viewports
- **Accessibility needs**: Tests verify keyboard navigation and screen reader support

## Authentication Strategy

Since E2E tests run against a real application:

1. **Mock authentication**: Tests use mock credentials that may not authenticate
2. **State checking**: Tests verify the application's response to authentication attempts
3. **Fallback testing**: If authentication fails, tests verify error handling
4. **Conditional flows**: Tests adapt based on whether authentication succeeds

## Accessibility Testing

Comprehensive accessibility checks include:

- **ARIA compliance**: Proper roles, labels, and relationships
- **Keyboard navigation**: Full keyboard accessibility
- **Color contrast**: Sufficient contrast ratios
- **Focus management**: Visible focus indicators
- **Screen reader support**: Proper heading hierarchy and landmarks
- **Reduced motion**: Respect for user motion preferences

## Mobile Testing

Mobile-specific testing covers:

- **Touch interactions**: Tap, swipe, and gesture support
- **Viewport adaptation**: Responsive design across screen sizes
- **Touch targets**: Minimum 44x44px touch targets
- **Orientation changes**: Portrait and landscape modes
- **Zoom levels**: Functionality at different zoom levels
- **Progressive Web App**: PWA features and manifest

## Debugging

### Common Issues

1. **Element not found**: Use broader selectors or check element visibility
2. **Timing issues**: Add appropriate waits or increase timeouts
3. **Authentication failures**: Verify test user credentials or use mock authentication
4. **Network timeouts**: Check if development server is running

### Debug Tools

```bash
# Run specific test with debug mode
npx playwright test auth.spec.ts --debug

# Show test report with traces
npm run test:e2e:report

# Run with browser UI
npm run test:e2e:headed
```

### Screenshots and Videos

Failed tests automatically capture:

- Screenshots saved to `test-results/`
- Videos saved to `test-results/`
- Traces for detailed debugging

## Best Practices

1. **Independent tests**: Each test should be self-contained
2. **Cleanup**: Clear state between tests
3. **Meaningful assertions**: Test behavior, not implementation
4. **Error handling**: Test error states and edge cases
5. **Performance**: Consider test execution time
6. **Maintainability**: Use helpers and fixtures for reusable code

## Continuous Integration

Tests are configured for CI environments:

- **Reduced parallelism**: Single worker on CI for stability
- **Automatic retries**: 2 retries for flaky tests
- **Headless mode**: No browser UI in CI
- **Report generation**: HTML reports accessible after CI runs

## Contributing

When adding new E2E tests:

1. **Follow naming conventions**: Use descriptive test names
2. **Use existing helpers**: Leverage auth-helpers and page-helpers
3. **Add test data**: Update fixtures/test-data.ts as needed
4. **Document new patterns**: Update this README for new testing patterns
5. **Test across browsers**: Ensure tests work on all configured browsers

## Performance Considerations

- **Selective testing**: Run specific test suites during development
- **Parallel execution**: Tests run in parallel for faster execution
- **Resource cleanup**: Proper browser context cleanup
- **Efficient selectors**: Use efficient CSS selectors and avoid complex XPath
