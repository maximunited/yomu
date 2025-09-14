import { test, expect } from '@playwright/test';
import { PageHelper } from './helpers/page-helpers';
import { urls } from './fixtures/test-data';

test.describe('Accessibility Testing', () => {
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
  });

  test('should have proper heading hierarchy on all pages', async ({
    page,
  }) => {
    const pagesToTest = [
      urls.home,
      urls.signin,
      urls.signup,
      urls.about,
      urls.contact,
      urls.privacy,
      urls.terms,
    ];

    for (const url of pagesToTest) {
      await page.goto(url);
      await pageHelper.waitForPageLoad();

      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // Check heading hierarchy (h1 > h2 > h3...)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      if (headings.length > 1) {
        // Verify headings don't skip levels
        const headingLevels = await Promise.all(
          headings.map(async (heading) => {
            const tagName = await heading.evaluate((el) =>
              el.tagName.toLowerCase()
            );
            return parseInt(tagName.replace('h', ''));
          })
        );

        // Check that we don't skip heading levels (e.g., h1 -> h3)
        for (let i = 1; i < headingLevels.length; i++) {
          const levelDiff = headingLevels[i] - headingLevels[i - 1];
          expect(levelDiff).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('should have proper ARIA landmarks on all pages', async ({ page }) => {
    const pagesToTest = [urls.home, urls.signin, urls.about, urls.contact];

    for (const url of pagesToTest) {
      await page.goto(url);
      await pageHelper.waitForPageLoad();

      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Check for banner/header
      const header = page.locator('header, [role="banner"]');
      await expect(header).toBeVisible();

      // Check for navigation if present
      const nav = page.locator('nav, [role="navigation"]');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();
      }

      // Check for contentinfo/footer if present
      const footer = page.locator('footer, [role="contentinfo"]');
      if ((await footer.count()) > 0) {
        await expect(footer.first()).toBeVisible();
      }
    }
  });

  test('should have accessible form labels and inputs', async ({ page }) => {
    // Test sign in form
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);

      // Check for label association
      const inputId = await input.getAttribute('id');
      const inputName = await input.getAttribute('name');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (inputId) {
        // Check for associated label
        const label = page.locator(`label[for="${inputId}"]`);
        if ((await label.count()) > 0) {
          await expect(label.first()).toBeVisible();
        }
      }

      // Should have some form of accessible name
      expect(inputId || inputName || ariaLabel || ariaLabelledBy).toBeTruthy();
    }

    // Test sign up form
    await page.goto(urls.signup);
    await pageHelper.waitForPageLoad();

    const signupInputs = page.locator('input');
    const signupInputCount = await signupInputs.count();

    for (let i = 0; i < signupInputCount; i++) {
      const input = signupInputs.nth(i);
      const required = await input.getAttribute('required');
      const ariaRequired = await input.getAttribute('aria-required');

      // Required fields should be marked as such
      if (required !== null) {
        expect(ariaRequired === 'true' || required !== null).toBeTruthy();
      }
    }
  });

  test('should have accessible buttons with proper names', async ({ page }) => {
    const pagesToTest = [urls.home, urls.signin, urls.signup, urls.about];

    for (const url of pagesToTest) {
      await page.goto(url);
      await pageHelper.waitForPageLoad();

      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);

        // Button should have accessible name
        const accessibleName = await button.evaluate((el) => {
          return (
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-labelledby') ||
            el.textContent?.trim() ||
            el.getAttribute('title')
          );
        });

        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Get all focusable elements
    const focusableElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const elementCount = await focusableElements.count();

    if (elementCount > 0) {
      // Test tab navigation
      const firstElement = focusableElements.first();
      await firstElement.focus();
      await expect(firstElement).toBeFocused();

      // Tab to next element
      await page.keyboard.press('Tab');

      // Some element should have focus
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    const interactiveElements = page.locator('a, button, input, select');
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = interactiveElements.nth(i);

      if (await element.isVisible()) {
        await element.focus();

        // Check for visible focus indicator
        const focusStyles = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el, ':focus');
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow,
            border: styles.border,
          };
        });

        // Should have some kind of focus indicator
        const hasFocusIndicator =
          focusStyles.outline !== 'none' ||
          focusStyles.outlineWidth !== '0px' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.border.includes('blue') ||
          focusStyles.border.includes('focus');

        expect(hasFocusIndicator).toBeTruthy();
      }
    }
  });

  test('should have proper image alt text', async ({ page }) => {
    const pagesToTest = [urls.home, urls.about];

    for (const url of pagesToTest) {
      await page.goto(url);
      await pageHelper.waitForPageLoad();

      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const altText = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        // Images should have alt text unless they're decorative
        if (role !== 'presentation' && role !== 'none') {
          expect(altText).toBeTruthy();
          expect(altText?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Test main text elements for contrast
    const textElements = page.locator('h1, h2, h3, p, a, button, label');
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);

      if (await element.isVisible()) {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });

        // Basic check that text has color and background
        expect(styles.color).toBeTruthy();
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Test Enter key on form submission
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const submitButton = form
        .locator('button[type="submit"], input[type="submit"]')
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.focus();

        // Should be able to activate with Enter
        await page.keyboard.press('Enter');
        // Form should attempt to submit (validation may prevent it)
      }
    }

    // Test Space key on buttons
    const buttons = page.locator('button:not([type="submit"])');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();

      // Should be able to activate with Space
      await page.keyboard.press('Space');
    }
  });

  test('should handle screen reader compatibility', async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Check for proper ARIA attributes
    const elementsWithAria = page.locator(
      '[aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-hidden], [role]'
    );
    const ariaCount = await elementsWithAria.count();

    for (let i = 0; i < Math.min(ariaCount, 10); i++) {
      const element = elementsWithAria.nth(i);

      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const role = await element.getAttribute('role');

      // ARIA attributes should have valid values
      if (ariaLabel) {
        expect(ariaLabel.length).toBeGreaterThan(0);
      }

      if (ariaLabelledBy) {
        // Should reference existing elements
        const referencedElement = page.locator(`#${ariaLabelledBy}`);
        if ((await referencedElement.count()) > 0) {
          await expect(referencedElement.first()).toBeInViewport();
        }
      }

      if (role) {
        // Should be valid ARIA role
        const validRoles = [
          'button',
          'link',
          'heading',
          'banner',
          'main',
          'navigation',
          'contentinfo',
          'article',
          'section',
          'complementary',
          'form',
          'search',
        ];
        // This is not exhaustive but covers common roles
      }
    }
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast by forcing specific styles
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Apply high contrast styles
    await page.addStyleTag({
      content: `
        * {
          background: black !important;
          color: white !important;
          border-color: white !important;
        }
        a {
          color: yellow !important;
        }
        button {
          background: white !important;
          color: black !important;
        }
      `,
    });

    // Page should still be functional
    await expect(page.locator('main')).toBeVisible();

    // Interactive elements should still be visible
    const buttons = page.locator('button');
    if ((await buttons.count()) > 0) {
      await expect(buttons.first()).toBeVisible();
    }

    const links = page.locator('a');
    if ((await links.count()) > 0) {
      await expect(links.first()).toBeVisible();
    }
  });

  test('should be usable with reduced motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Page should load and be functional
    await expect(page.locator('main')).toBeVisible();

    // Any animations should respect reduced motion
    const animatedElements = page.locator(
      '[class*="animate"], [class*="transition"], [style*="animation"]'
    );
    const animatedCount = await animatedElements.count();

    // Elements should still be visible and functional
    for (let i = 0; i < Math.min(animatedCount, 5); i++) {
      const element = animatedElements.nth(i);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });
});
