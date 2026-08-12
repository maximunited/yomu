import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';

import { urls } from './fixtures/test-data';
import { PageHelper } from './helpers/page-helpers';
import {
  GOLDEN_BENEFIT_ACTIVE_TITLE,
  GOLDEN_BENEFIT_UPCOMING_TITLE,
  GOLDEN_BRAND_ACTIVE,
  GOLDEN_BRAND_UPCOMING,
} from './helpers/seed-benefit-golden-path';

test.describe.configure({ mode: 'serial' });

test.describe('Benefit window golden path (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test('shows Active Now and Coming Soon for seeded window benefits', async ({
    page,
  }) => {
    const pageHelper = new PageHelper(page);
    await page.goto(urls.dashboard);
    await pageHelper.waitForPageLoad();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    const activeHeading = page.getByRole('heading', {
      name: /Active Now|פעיל עכשיו/,
    });
    const upcomingHeading = page.getByRole('heading', {
      name: /Coming Soon|בקרוב/,
    });
    await expect(activeHeading).toBeVisible({ timeout: 15000 });
    await expect(upcomingHeading).toBeVisible({ timeout: 15000 });

    const activeArticle = page.getByRole('article', {
      name: `${GOLDEN_BRAND_ACTIVE} - ${GOLDEN_BENEFIT_ACTIVE_TITLE}`,
    });
    const upcomingArticle = page.getByRole('article', {
      name: `${GOLDEN_BRAND_UPCOMING} - ${GOLDEN_BENEFIT_UPCOMING_TITLE}`,
    });

    await expect(activeArticle.first()).toBeVisible({ timeout: 15000 });
    await expect(upcomingArticle.first()).toBeVisible({ timeout: 15000 });

    // Exact-date fixture must not appear under Active Now
    const activeSection = activeHeading.locator(
      'xpath=ancestor::div[contains(@class,"mb-8")][1]'
    );
    await expect(
      activeSection.getByRole('article', {
        name: `${GOLDEN_BRAND_UPCOMING} - ${GOLDEN_BENEFIT_UPCOMING_TITLE}`,
      })
    ).toHaveCount(0);

    // 30-day fixture must appear under Active Now
    await expect(
      activeSection.getByRole('article', {
        name: `${GOLDEN_BRAND_ACTIVE} - ${GOLDEN_BENEFIT_ACTIVE_TITLE}`,
      })
    ).toBeVisible();
  });

  test('remindEnabled toggle hides upcoming benefit from Reminders', async ({
    page,
  }) => {
    const pageHelper = new PageHelper(page);

    await page.goto(urls.memberships);
    await pageHelper.waitForPageLoad();
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    const remindButton = page
      .locator('div.rounded-xl, div.rounded-lg, div[class*="rounded"]')
      .filter({ has: page.getByText(GOLDEN_BRAND_UPCOMING, { exact: true }) })
      .getByRole('button', { name: /Remind before benefit window|תזכורת/ })
      .first();

    await expect(remindButton).toBeVisible({ timeout: 15000 });

    const patchPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/user/memberships') &&
        res.request().method() === 'PATCH' &&
        res.status() === 200,
      { timeout: 15000 }
    );
    await remindButton.click();
    await patchPromise;

    await page.goto(urls.dashboard);
    await pageHelper.waitForPageLoad();

    const remindersHeading = page.getByRole('heading', {
      name: /Reminders|תזכורות/,
    });

    if (await remindersHeading.isVisible().catch(() => false)) {
      const remindersSection = remindersHeading.locator(
        'xpath=ancestor::div[contains(@class,"mb-8")][1]'
      );
      await expect(
        remindersSection.getByRole('article', {
          name: new RegExp(GOLDEN_BRAND_UPCOMING),
        })
      ).toHaveCount(0);
    }

    // Coming Soon still lists the upcoming benefit regardless of remind flag
    await expect(
      page
        .getByRole('article', {
          name: `${GOLDEN_BRAND_UPCOMING} - ${GOLDEN_BENEFIT_UPCOMING_TITLE}`,
        })
        .first()
    ).toBeVisible();

    // Restore remindEnabled for subsequent runs
    await page.goto(urls.memberships);
    await pageHelper.waitForPageLoad();
    const restoreBtn = page
      .locator('div.rounded-xl, div.rounded-lg, div[class*="rounded"]')
      .filter({ has: page.getByText(GOLDEN_BRAND_UPCOMING, { exact: true }) })
      .getByRole('button', { name: /Remind before benefit window|תזכורת/ })
      .first();
    const restorePatch = page.waitForResponse(
      (res) =>
        res.url().includes('/api/user/memberships') &&
        res.request().method() === 'PATCH' &&
        res.status() === 200,
      { timeout: 15000 }
    );
    await restoreBtn.click();
    await restorePatch;
  });
});
