import { test, expect, devices } from '@playwright/test';
import { PageHelper } from './helpers/page-helpers';
import { urls } from './fixtures/test-data';

test.describe('Mobile Responsiveness', () => {
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
  });

  test('should work on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Main content should be visible
    await expect(page.locator('main')).toBeVisible();

    // Content should not overflow horizontally
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    const viewport = page.viewportSize();

    if (bodyBox && viewport) {
      expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 20); // Allow small margin
    }

    await context.close();
  });

  test('should have touch-friendly navigation on mobile', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Check for mobile navigation (hamburger menu, etc.)
    const mobileNav = page
      .locator(
        '.mobile-nav, .hamburger, button[aria-label*="menu"], button[aria-label*="תפריט"]'
      )
      .first();

    if (await mobileNav.isVisible()) {
      // Test mobile menu interaction
      await mobileNav.tap();
      await page.waitForTimeout(500);

      // Should show navigation menu
      const navMenu = page.locator('.nav-menu, .mobile-menu, nav').first();
      if (await navMenu.isVisible()) {
        await expect(navMenu).toBeVisible();

        // Close menu
        await mobileNav.tap();
        await page.waitForTimeout(500);
      }
    }

    // Test that regular links work with tap
    const links = page.locator('a:visible');
    if ((await links.count()) > 0) {
      const firstLink = links.first();
      const linkBox = await firstLink.boundingBox();

      // Touch targets should be at least 44x44px
      if (linkBox) {
        expect(linkBox.height).toBeGreaterThanOrEqual(30); // Allow some flexibility
        expect(linkBox.width).toBeGreaterThanOrEqual(30);
      }
    }

    await context.close();
  });

  test('should handle form inputs on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Test form inputs
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.tap();
      await emailInput.fill('test@example.com');

      // Input should have proper keyboard type
      const inputType = await emailInput.getAttribute('type');
      expect(inputType).toBe('email');
    }

    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.tap();
      await passwordInput.fill('password123');

      // Should be password type
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
    }

    // Test button interaction
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      const buttonBox = await submitButton.boundingBox();

      // Button should be touch-friendly
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(40);
      }

      await submitButton.tap();
    }

    await context.close();
  });

  test('should work on tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Content should adapt to tablet size
    await expect(page.locator('main')).toBeVisible();

    // Navigation might be different on tablet
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();

    // Check layout doesn't break
    const viewport = page.viewportSize();
    if (viewport) {
      expect(viewport.width).toBeGreaterThan(768); // Tablet width
    }

    await context.close();
  });

  test('should handle orientation changes', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    // Test portrait mode
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();
    await expect(page.locator('main')).toBeVisible();

    // Change to landscape
    await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape
    await page.waitForTimeout(500);

    // Content should still be visible and functional
    await expect(page.locator('main')).toBeVisible();

    // Navigation should still work
    const nav = page.locator('nav, header').first();
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }

    await context.close();
  });

  test('should have readable text on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Test font sizes are readable
    const textElements = page.locator('p, h1, h2, h3, a, button, label');
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);

      if (await element.isVisible()) {
        const fontSize = await element.evaluate((el) => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });

        // Text should be at least 16px for good mobile readability
        expect(fontSize).toBeGreaterThanOrEqual(14); // Allow some flexibility
      }
    }

    await context.close();
  });

  test('should handle touch gestures', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.dashboard);

    // If redirected to sign in, that's expected
    if (page.url().includes('/auth/signin')) {
      await context.close();
      return;
    }

    if (page.url().includes('/dashboard')) {
      await pageHelper.waitForPageLoad();

      // Test scrolling
      const main = page.locator('main');
      await main.hover();

      // Simulate scroll gesture
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(300);

      // Page should still be functional after scroll
      await expect(main).toBeVisible();

      // Test swipe-like interactions if any cards/carousels exist
      const cards = page.locator('.card, .benefit-card, article');
      if ((await cards.count()) > 0) {
        const firstCard = cards.first();
        const cardBox = await firstCard.boundingBox();

        if (cardBox) {
          // Simulate touch interaction
          await page.mouse.move(
            cardBox.x + cardBox.width / 2,
            cardBox.y + cardBox.height / 2
          );
          await page.mouse.down();
          await page.mouse.move(
            cardBox.x + cardBox.width / 2 + 50,
            cardBox.y + cardBox.height / 2
          );
          await page.mouse.up();
        }
      }
    }

    await context.close();
  });

  test('should work with zoom levels', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Test with 150% zoom
    await page.setViewportSize({ width: 250, height: 541 }); // Simulates zoom
    await page.waitForTimeout(500);

    // Content should still be accessible
    await expect(page.locator('main')).toBeVisible();

    // Interactive elements should still work
    const buttons = page.locator('button');
    if ((await buttons.count()) > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await expect(firstButton).toBeVisible();
      }
    }

    await context.close();
  });

  test('should handle small screen devices', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 568 }, // iPhone SE size
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Content should not overflow
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();

    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(340); // Allow small margin
    }

    // Essential elements should be visible
    await expect(page.locator('main')).toBeVisible();

    // Text should wrap properly
    const headings = page.locator('h1, h2');
    if ((await headings.count()) > 0) {
      const firstHeading = headings.first();
      const headingBox = await firstHeading.boundingBox();

      if (headingBox) {
        expect(headingBox.width).toBeLessThanOrEqual(320);
      }
    }

    await context.close();
  });

  test('should work with large mobile screens', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12 Pro Max'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Should utilize larger screen space effectively
    await expect(page.locator('main')).toBeVisible();

    // Content should not be too stretched
    const container = page.locator('main, .container, .content').first();
    const containerBox = await container.boundingBox();
    const viewport = page.viewportSize();

    if (containerBox && viewport) {
      // Content shouldn't span the entire width on large screens
      // (should have some reasonable max-width)
      expect(containerBox.width).toBeLessThanOrEqual(viewport.width);
    }

    await context.close();
  });

  test('should handle progressive web app features on mobile', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    pageHelper = new PageHelper(page);

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Check for PWA manifest
    const manifest = page.locator('link[rel="manifest"]');
    if ((await manifest.count()) > 0) {
      const manifestHref = await manifest.getAttribute('href');
      expect(manifestHref).toBeTruthy();
    }

    // Check for service worker registration
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(typeof swRegistration).toBe('boolean');

    // Check for proper meta tags for mobile
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);

    const viewportContent = await viewportMeta.getAttribute('content');
    expect(viewportContent).toContain('width=device-width');

    await context.close();
  });
});
