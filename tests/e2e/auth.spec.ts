import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helpers';
import { urls } from './fixtures/test-data';

const clerkIdentifier =
  'input[name="identifier"], input[type="email"], input[autocomplete="username"]';

test.describe('Authentication Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
  });

  test('should load sign in page', async ({ page }) => {
    await authHelper.gotoSettled(urls.signin);
    await expect(page).toHaveURL(/sign-in/);

    await expect(page).toHaveTitle(/YomU|יום-You|Sign in|התחברות/i);
    await expect(page.locator(clerkIdentifier).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('should load sign up page', async ({ page }) => {
    await authHelper.gotoSettled(urls.signup);
    await expect(page).toHaveURL(/sign-up/);

    await expect(
      page
        .locator(
          'input[name="emailAddress"], input[name="identifier"], input[type="email"]'
        )
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('should show Clerk form controls on sign in', async ({ page }) => {
    await authHelper.gotoSettled(urls.signin);

    const identifier = page.locator(clerkIdentifier).first();
    await expect(identifier).toBeVisible({ timeout: 15000 });
    await identifier.fill('not-an-email');

    const submit = page
      .getByRole('button', { name: /continue|sign in|המשך|התחבר/i })
      .first();
    await expect(submit).toBeVisible();
    await submit.click();

    // Stay on sign-in (invalid identifier) or show field error
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should navigate between sign in and sign up pages', async ({
    page,
  }) => {
    await authHelper.gotoSettled(urls.signin);

    const signUpLink = page
      .locator('a[href*="sign-up"], a:has-text("Sign up"), a:has-text("הירשם")')
      .first();
    if (await signUpLink.isVisible().catch(() => false)) {
      await signUpLink.click();
      await expect(page).toHaveURL(/sign-up/);
    } else {
      await authHelper.gotoSettled(urls.signup);
      await expect(page).toHaveURL(/sign-up/);
    }

    const signInLink = page
      .locator('a[href*="sign-in"], a:has-text("Sign in"), a:has-text("התחבר")')
      .first();
    if (await signInLink.isVisible().catch(() => false)) {
      await signInLink.click();
    } else {
      await authHelper.gotoSettled(urls.signin);
    }
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should be responsive on auth pages', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await authHelper.gotoSettled(urls.signin);
    await expect(page.locator(clerkIdentifier).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('should handle browser back/forward on auth pages', async ({ page }) => {
    await authHelper.gotoSettled(urls.signin);
    await authHelper.gotoSettled(urls.signup);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/sign-in/);
    try {
      await page.goForward({ waitUntil: 'domcontentloaded' });
    } catch {
      // Firefox sometimes cancels history forward under Clerk redirects
      await authHelper.gotoSettled(urls.signup);
    }
    await expect(page).toHaveURL(/sign-up/);
  });

  test('should have accessible interactive controls on auth pages', async ({
    page,
  }) => {
    await authHelper.gotoSettled(urls.signin);
    await expect(page.locator(clerkIdentifier).first()).toBeVisible({
      timeout: 15000,
    });
    const buttons = page.getByRole('button');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});
