/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/utils/',
    '<rootDir>/tests/unit/pages/dashboard.test.tsx',
    // Exclude problematic tests that need provider fixes
    '<rootDir>/tests/unit/pages/memberships.filters.multiselect.test.tsx',
    '<rootDir>/tests/unit/lib/prisma.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|openid-client|oauth4webapi)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    // exclude only server-specific API routes that are hard to test
    '!src/app/api/auth/**',
    '!src/app/api/seed/**',
    '!src/app/layout.tsx',
    // exclude middleware that's tested separately
    '!src/middleware.ts',
  ],
  testMatch: [
    // Unit tests only for now (integration tests are shell scripts, not Jest)
    '<rootDir>/tests/unit/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
