import { defineConfig, devices } from '@playwright/test';
import { loadClerkE2EEnv } from './tests/e2e/helpers/clerk-env';

loadClerkE2EEnv();

const hasClerkE2EUser = Boolean(process.env.E2E_CLERK_USER_EMAIL);

/**
 * @see https://playwright.dev/docs/test-configuration
 * Clerk auth: https://clerk.com/docs/guides/development/testing/playwright/overview
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/global\.setup\.ts/, /\.authenticated\.spec\.ts/],
      dependencies: ['setup'],
    },
    ...(hasClerkE2EUser
      ? [
          {
            name: 'chromium-authenticated',
            testMatch: /\.authenticated\.spec\.ts/,
            use: {
              ...devices['Desktop Chrome'],
              storageState: 'playwright/.clerk/user.json',
            },
            dependencies: ['setup'],
          },
        ]
      : []),
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: [/global\.setup\.ts/, /\.authenticated\.spec\.ts/],
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: [/global\.setup\.ts/, /\.authenticated\.spec\.ts/],
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: [/global\.setup\.ts/, /\.authenticated\.spec\.ts/],
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: [/global\.setup\.ts/, /\.authenticated\.spec\.ts/],
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
