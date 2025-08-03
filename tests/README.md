# YomU Test Suite

This directory contains all test scripts for the YomU application.

## Directory Structure

### `/integration`
Integration tests that verify end-to-end functionality:
- `test-connection.js` - Basic Prisma connection test
- `test-partnerships.js` - Basic partnership system tests
- `test-multi-brand-partnerships.js` - Multi-brand partnership creation tests
- `test-complex-membership-api.js` - Complex membership API scenarios
- `test-memberships-api.js` - Membership API data flow tests
- `test-ui-partnerships.js` - UI partnership display tests
- `test-custom-memberships-partnerships.js` - Custom membership isolation tests
- `test-missing-translations.js` - Translation completeness validation
- `final-multi-brand-test.js` - Comprehensive multi-brand system test
- `test-benefit-detail.js` - Benefit detail page tests
- `test-benefits.js` - Benefits system tests
- `test-dashboard.js` - Dashboard functionality tests

### `/api`
API-specific tests:
- `test-api.js` - HTTP API endpoint tests

## Scripts Directory (`/scripts`)

Utility scripts for data setup and maintenance:
- `seed.js` - Basic database seeding
- `seed-comprehensive.js` - Comprehensive data seeding
- `seed-with-validation.js` - Seeding with validation
- `add-giraffe-partnership.js` - Create Giraffe partnership
- `create-partnerships.js` - Partnership creation utilities
- `update-validity-types.js` - Database maintenance
- `docker-setup.sh` - Docker environment setup

## Usage

### Running Integration Tests
```bash
# Run individual tests
node tests/integration/test-connection.js
node tests/integration/test-partnerships.js
node tests/integration/final-multi-brand-test.js

# Run comprehensive partnership test
npm run test:partnerships
```

### Running API Tests
```bash
# Run API endpoint tests
node tests/api/test-api.js
npm run test:api
```

### Running Validation Tests
```bash
# Check for missing translations
npm run test:translations
node tests/integration/test-missing-translations.js
```

### Database Setup
```bash
# Seed database with comprehensive data
node scripts/seed-comprehensive.js

# Create partnerships
node scripts/create-partnerships.js
```

## Test Rules for Contributors

1. **Tests vs Scripts separation**:
   - **Tests** (`/tests`): Verify functionality, validate behavior
   - **Scripts** (`/scripts`): Create data, setup environment, maintenance

2. **Naming conventions**:
   - Tests: `test-[feature].js`
   - Scripts: `[action]-[target].js`

3. **Best practices**:
   - Include error handling and cleanup in all tests
   - Document test purpose and expected outcomes
   - Always disconnect Prisma client at the end
   - Use descriptive console output

## Claude Code AI Instructions

When creating new files:
- **Tests** go in `/tests/integration/` or `/tests/api/`
- **Scripts** go in `/scripts/`
- Follow existing naming conventions
- Include comprehensive error handling
- Always clean up resources (Prisma, files, etc.)
- Document the purpose clearly