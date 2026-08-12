import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';
import { urls } from './fixtures/test-data';
import { PageHelper } from './helpers/page-helpers';

test.describe('Memberships (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test('loads memberships when signed in', async ({ page }) => {
    const pageHelper = new PageHelper(page);
    await page.goto(urls.memberships);
    await pageHelper.waitForPageLoad();

    await expect(page).toHaveURL(/memberships/);
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });
});
