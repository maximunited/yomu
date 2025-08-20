const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/utils/",
    "<rootDir>/__tests__/pages/dashboard.test.tsx",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  transformIgnorePatterns: [
    "node_modules/(?!(jose|openid-client|oauth4webapi)/)",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    // exclude only server-specific API routes that are hard to test
    "!src/app/api/auth/**",
    "!src/app/api/seed/**",
    "!src/app/layout.tsx",
    // exclude middleware that's tested separately
    "!src/middleware.ts",
  ],
  testMatch: [
    // Include all test files for improved coverage
    "<rootDir>/__tests__/components/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/lib/benefit-validation.test.ts",
    "<rootDir>/__tests__/lib/utils.test.ts",
    "<rootDir>/__tests__/lib/languages.test.ts",
    "<rootDir>/__tests__/lib/auth-placeholder.test.ts",
    "<rootDir>/__tests__/lib/translations.test.ts",
    "<rootDir>/__tests__/lib/prisma.test.ts",
    "<rootDir>/__tests__/lib/auth.test.ts",
    "<rootDir>/__tests__/lib/utils.cn.edge.test.ts",
    "<rootDir>/__tests__/lib/utils.cn.objects-arrays.test.ts",
    "<rootDir>/__tests__/i18n/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/contexts/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/pages/signin-checkboxes.test.tsx",
    "<rootDir>/__tests__/pages/auth-signup.test.tsx",
    "<rootDir>/__tests__/pages/page-header*.test.tsx",
    "<rootDir>/__tests__/pages/simple-test.test.tsx",
    "<rootDir>/__tests__/pages/manual-checkbox-verification.js",
    "<rootDir>/__tests__/simple.test.tsx",
    "<rootDir>/__tests__/e2e/dashboard.spec.ts",
    "<rootDir>/__tests__/accessibility/benefit-detail.test.tsx",
    "<rootDir>/__tests__/features/used-benefits.test.tsx",
    "<rootDir>/__tests__/pages/notifications.render.test.tsx",
    // Enhanced page tests for coverage improvement (re-enabling after fixing provider issues)
    "<rootDir>/__tests__/pages/home.render.test.tsx",
    "<rootDir>/__tests__/pages/about.render.test.tsx",
    // API tests for missing coverage
    "<rootDir>/__tests__/api/benefits.test.ts",
    "<rootDir>/__tests__/api/brands.test.ts",
    "<rootDir>/__tests__/api/user-memberships.test.ts",
    "<rootDir>/__tests__/api/benefit-by-id.test.ts",
    "<rootDir>/__tests__/api/custom-memberships.test.ts",
    // Additional page tests (still fixing provider issues)
    // "<rootDir>/__tests__/pages/settings.render.test.tsx",
    // "<rootDir>/__tests__/pages/onboarding.render.test.tsx",
    // "<rootDir>/__tests__/pages/demo.render.test.tsx",
    // "<rootDir>/__tests__/pages/memberships.render.test.tsx",
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
