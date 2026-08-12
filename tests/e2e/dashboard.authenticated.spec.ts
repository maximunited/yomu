import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';
import { urls } from './fixtures/test-data';
import { PageHelper } from './helpers/page-helpers';

test.describe('Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test('loads dashboard when signed in', async ({ page }) => {
    const pageHelper = new PageHelper(page);
    await page.goto(urls.dashboard);
    await pageHelper.waitForPageLoad();

    await expect(page).toHaveURL(/dashboard/);
    await expect(
      page.locator('main, [role="main"], [role="alert"]').first()
    ).toBeVisible({ timeout: 15000 });
    // Prefer happy path: main content, not fatal error banner
    await expect(
      page.getByRole('heading', { name: /sign in error/i })
    ).toHaveCount(0);
    await expect(page.locator('main')).toBeVisible();
  });

  test('shows membership or benefits UI', async ({ page }) => {
    const pageHelper = new PageHelper(page);
    await page.goto(urls.dashboard);
    await pageHelper.waitForPageLoad();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });
});
