import { Page, expect } from '@playwright/test';
import { testUsers, urls } from '../fixtures/test-data';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Sign in with test credentials
   */
  async signIn(
    email = testUsers.validUser.email,
    password = testUsers.validUser.password
  ) {
    await this.page.goto(urls.signin);

    // Wait for sign in form to load
    await expect(this.page.locator('form')).toBeVisible();

    // Fill in credentials
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);

    // Submit form
    await this.page.click('button[type="submit"]');

    // Wait for navigation after successful login
    await this.page.waitForURL(urls.dashboard);

    // Verify we're logged in by checking for dashboard content
    await expect(this.page).toHaveURL(urls.dashboard);
  }

  /**
   * Sign up with test credentials
   */
  async signUp(userData = testUsers.validUser) {
    await this.page.goto(urls.signup);

    // Wait for sign up form to load
    await expect(this.page.locator('form')).toBeVisible();

    // Fill in registration details
    await this.page.fill('input[name="name"]', userData.name);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="dateOfBirth"]', userData.dateOfBirth);

    // Submit form
    await this.page.click('button[type="submit"]');

    // Wait for successful registration redirect
    await this.page.waitForURL(urls.onboarding);
    await expect(this.page).toHaveURL(urls.onboarding);
  }

  /**
   * Sign out
   */
  async signOut() {
    // Look for sign out button/link
    const signOutButton = this.page.locator(
      'button:has-text("התנתק"), button:has-text("Sign Out"), a:has-text("התנתק"), a:has-text("Sign Out")'
    );

    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    }

    // Wait for redirect to home or sign in page
    await this.page.waitForURL(new RegExp(`(${urls.home}|${urls.signin})`));
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Try to go to dashboard - if not authenticated, should redirect
      await this.page.goto(urls.dashboard);
      return this.page.url().includes('/dashboard');
    } catch {
      return false;
    }
  }

  /**
   * Ensure user is authenticated (sign in if not)
   */
  async ensureAuthenticated() {
    if (!(await this.isAuthenticated())) {
      await this.signIn();
    }
  }

  /**
   * Clear all auth state
   */
  async clearAuth() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
