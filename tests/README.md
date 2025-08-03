# YomU Test Suite

This directory contains all test scripts and utilities for the YomU application.

## Directory Structure

### `/integration`

Integration tests that verify end-to-end functionality:
- `test-partnerships.js` - Basic partnership system tests
- `test-multi-brand-partnerships.js` - Multi-brand partnership creation tests
- `test-complex-membership-api.js` - Complex membership API scenarios
- `test-memberships-api.js` - Membership API data flow tests
- `test-ui-partnerships.js` - UI partnership display tests
- `final-multi-brand-test.js` - Comprehensive multi-brand system test
- `create-partnerships.js` - Partnership creation utilities
- `add-giraffe-partnership.js` - Legacy Giraffe partnership setup

### `/api`

API and database seeding utilities:
- `seed.js` - Basic database seeding
- `seed-comprehensive.js` - Comprehensive data seeding
- `seed-with-validation.js` - Seeding with validation

## Usage

### Running Integration Tests

```bash
# Run individual tests
node tests/integration/test-partnerships.js
node tests/integration/final-multi-brand-test.js

# Run all partnership tests
npm run test:partnerships
```

### Running API Tests

```bash
# Seed database
node tests/api/seed-comprehensive.js

# Run API-specific tests
npm run test:api
```

## Test Rules for Contributors

1. **All test scripts must be in this `/tests` directory**
2. **Use descriptive names following the pattern `test-[feature].js`**
3. **Include error handling and cleanup in all tests**
4. **Document test purpose and expected outcomes**
5. **Always disconnect Prisma client at the end of tests**

## Claude Code AI Instructions

When creating new tests:

- Place integration tests in `/tests/integration/`
- Place API tests in `/tests/api/`
- Follow existing naming conventions
- Include comprehensive error handling
- Always clean up resources (Prisma, files, etc.)
