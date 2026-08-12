import { defineConfig, devices } from '@playwright/test';
import { loadClerkE2EEnv } from './tests/e2e/helpers/clerk-env';

loadClerkE2EEnv();

const hasClerkE2EUser = Boolean(process.env.E2E_CLERK_USER_EMAIL);
/** PR CI smoke: chromium public specs only (no firefox/webkit/mobile). */
const ciChromiumSmoke =
  process.env.CI === 'true' && !process.env.E2E_FULL_BROWSERS;

const publicProjectIgnore = [/global\.setup\.ts/, /\.authenticated\.spec\.ts/];

const chromiumProject = {
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
  testIgnore: publicProjectIgnore,
};

const localBrowserProjects = [
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
    testIgnore: publicProjectIgnore,
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
    testIgnore: publicProjectIgnore,
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
    testIgnore: publicProjectIgnore,
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
    testIgnore: publicProjectIgnore,
  },
];

/**
 * @see https://playwright.dev/docs/test-configuration
 * Clerk auth: https://clerk.com/docs/guides/development/testing/playwright/overview
 *
 * CI default: chromium public smoke only. Set E2E_FULL_BROWSERS=1 for local/nightly
 * multi-browser. Authenticated specs need E2E_CLERK_USER_EMAIL (not used in PR CI).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    ...(hasClerkE2EUser
      ? [
          {
            name: 'setup',
            testMatch: /global\.setup\.ts/,
          },
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
    chromiumProject,
    ...(ciChromiumSmoke ? [] : localBrowserProjects),
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
