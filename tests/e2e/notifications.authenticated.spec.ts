import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';
import { PageHelper } from './helpers/page-helpers';

test.describe('Notifications page (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test('loads notifications page with main content', async ({ page }) => {
    const pageHelper = new PageHelper(page);
    await page.goto('/notifications');
    await pageHelper.waitForPageLoad();

    await expect(page).toHaveURL(/notifications/);
    await expect(
      page.getByRole('heading', { name: /Notifications|התראות/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('shows empty or list state without fatal error', async ({ page }) => {
    const pageHelper = new PageHelper(page);
    await page.goto('/notifications');
    await pageHelper.waitForPageLoad();

    await expect(page.getByText(/sign in error|שגיאה בהתחברות/i)).toHaveCount(
      0
    );
    const hasItems = await page.locator('.rounded-xl.shadow-lg').count();
    const hasEmpty = await page
      .getByText(/No notifications|אין התראות/i)
      .count();
    expect(hasItems > 0 || hasEmpty > 0).toBeTruthy();
  });
});
