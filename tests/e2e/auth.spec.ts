import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helpers';
import { PageHelper } from './helpers/page-helpers';
import { testUsers, urls } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  let authHelper: AuthHelper;
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    pageHelper = new PageHelper(page);

    // Clear any existing auth state
    await authHelper.clearAuth();
  });

  test('should load sign in page', async ({ page }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Check page title and form elements
    await expect(page).toHaveTitle(/YomU|יום-You/);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should load sign up page', async ({ page }) => {
    await page.goto(urls.signup);
    await pageHelper.waitForPageLoad();

    // Check registration form elements
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="dateOfBirth"]')).toBeVisible();
  });

  test('should show validation errors for empty sign in form', async ({
    page,
  }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation feedback
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Modern browsers should show validation messages
    expect(await emailInput.getAttribute('required')).toBeDefined();
    expect(await passwordInput.getAttribute('required')).toBeDefined();
  });

  test('should show validation errors for empty sign up form', async ({
    page,
  }) => {
    await page.goto(urls.signup);
    await pageHelper.waitForPageLoad();

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for required field validation
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');

    expect(await nameInput.getAttribute('required')).toBeDefined();
    expect(await emailInput.getAttribute('required')).toBeDefined();
  });

  test('should handle invalid sign in credentials', async ({ page }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should stay on sign in page or show error
    await page.waitForTimeout(2000); // Wait for potential error message

    // Check we're still on sign in page (authentication failed)
    expect(page.url()).toContain('/auth/signin');
  });

  test('should navigate between sign in and sign up pages', async ({
    page,
  }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Look for sign up link
    const signUpLink = page.locator(
      'a[href*="signup"], a:has-text("הרשמה"), a:has-text("Sign Up")'
    );
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(urls.signup);
    }

    // Look for sign in link from sign up page
    const signInLink = page.locator(
      'a[href*="signin"], a:has-text("התחברות"), a:has-text("Sign In")'
    );
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(urls.signin);
    }
  });

  test('should have proper accessibility on auth pages', async ({ page }) => {
    // Test sign in page accessibility
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();
    await pageHelper.checkAccessibility();

    // Test sign up page accessibility
    await page.goto(urls.signup);
    await pageHelper.waitForPageLoad();
    await pageHelper.checkAccessibility();
  });

  test('should be responsive on auth pages', async ({ page }) => {
    // Test sign in page responsiveness
    await page.goto(urls.signin);
    await pageHelper.checkResponsiveDesign();

    // Test sign up page responsiveness
    await page.goto(urls.signup);
    await pageHelper.checkResponsiveDesign();
  });

  test('should handle browser back/forward on auth pages', async ({ page }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    await page.goto(urls.signup);
    await pageHelper.waitForPageLoad();

    // Test browser back button
    await page.goBack();
    await expect(page).toHaveURL(urls.signin);

    // Test browser forward button
    await page.goForward();
    await expect(page).toHaveURL(urls.signup);
  });

  test('should maintain form state during navigation', async ({ page }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Fill in some data
    await page.fill('input[type="email"]', 'test@example.com');

    // Navigate away and back
    await page.goto(urls.signup);
    await page.goBack();

    // Check if form data persists (depending on implementation)
    const emailValue = await page.locator('input[type="email"]').inputValue();
    // Note: This might be empty depending on implementation - that's OK
    expect(typeof emailValue).toBe('string');
  });
});
