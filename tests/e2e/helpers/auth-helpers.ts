import { Page, expect } from '@playwright/test';
import { testUsers, urls } from '../fixtures/test-data';
import { safeGoto } from './navigation';

/** Clerk sign-in identifier field (email/username). */
const clerkIdentifier = () =>
  'input[name="identifier"], input[type="email"], input[autocomplete="username"]';

const clerkPassword = () =>
  'input[name="password"], input[type="password"], input[autocomplete="current-password"]';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Sign in with test credentials (Clerk UI)
   */
  async signIn(
    email = testUsers.validUser.email,
    password = testUsers.validUser.password
  ) {
    await this.page.goto(urls.signin);
    await expect(this.page.locator(clerkIdentifier()).first()).toBeVisible({
      timeout: 15000,
    });

    await this.page.locator(clerkIdentifier()).first().fill(email);

    const continueBtn = this.page.getByRole('button', {
      name: /continue|המשך|next/i,
    });
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
    }

    await expect(this.page.locator(clerkPassword()).first()).toBeVisible({
      timeout: 15000,
    });
    await this.page.locator(clerkPassword()).first().fill(password);
    await this.page
      .getByRole('button', { name: /sign in|התחבר|continue|המשך/i })
      .first()
      .click();

    await this.page.waitForURL(
      new RegExp(`(${urls.dashboard}|${urls.onboarding}|/)`),
      { timeout: 20000 }
    );
  }

  /**
   * Sign up with test credentials (Clerk UI — email/password only)
   */
  async signUp(userData = testUsers.validUser) {
    await this.page.goto(urls.signup);
    await expect(this.page.locator(clerkIdentifier()).first()).toBeVisible({
      timeout: 15000,
    });

    const emailInput = this.page
      .locator(
        'input[name="emailAddress"], input[name="identifier"], input[type="email"]'
      )
      .first();
    await emailInput.fill(userData.email);

    const passwordInput = this.page.locator(clerkPassword()).first();
    if (await passwordInput.isVisible().catch(() => false)) {
      await passwordInput.fill(userData.password);
    }

    await this.page
      .getByRole('button', { name: /continue|sign up|הירשם|המשך/i })
      .first()
      .click();
  }

  /**
   * Sign out
   */
  async signOut() {
    const signOutButton = this.page.locator(
      'button:has-text("התנתק"), button:has-text("Sign Out"), a:has-text("התנתק"), a:has-text("Sign Out")'
    );

    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();
    }

    await this.page.waitForURL(
      new RegExp(`(${urls.home}|${urls.signin}|/sign-in)`)
    );
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.goto(urls.dashboard);
      await this.page.waitForLoadState('domcontentloaded');
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
   * Clear auth cookies/storage. Navigates to app origin first so
   * localStorage access is allowed (Clerk opaque origins throw otherwise).
   */
  async clearAuth() {
    await this.page.context().clearCookies();
    try {
      // about:blank first avoids racing an in-flight Clerk redirect
      await this.page.goto('about:blank', { waitUntil: 'domcontentloaded' });
      await this.page.goto(urls.home, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await this.page.evaluate(async () => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // ignore
        }
        try {
          // Clerk can persist client tokens in IndexedDB
          const dbs = await indexedDB.databases?.();
          if (dbs) {
            await Promise.all(
              dbs
                .filter((db) => db.name)
                .map(
                  (db) =>
                    new Promise<void>((resolve) => {
                      const req = indexedDB.deleteDatabase(db.name!);
                      req.onsuccess = () => resolve();
                      req.onerror = () => resolve();
                      req.onblocked = () => resolve();
                    })
                )
            );
          }
        } catch {
          // ignore
        }
      });
      await this.page.context().clearCookies();
    } catch {
      // ignore navigation/storage failures in auth teardown
    }
  }

  /**
   * Navigate to a path without racing Clerk client redirects.
   */
  async gotoSettled(path: string) {
    await safeGoto(this.page, path);
  }
}
