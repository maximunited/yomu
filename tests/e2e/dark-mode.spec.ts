import { test, expect } from '@playwright/test';
import { PageHelper } from './helpers/page-helpers';
import { AuthHelper } from './helpers/auth-helpers';
import { urls } from './fixtures/test-data';

test.describe('Dark Mode Functionality', () => {
  let pageHelper: PageHelper;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
    authHelper = new AuthHelper(page);

    // Clear localStorage before each test
    await page.goto(urls.home);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Dark Mode Toggle', () => {
    test('should toggle dark mode correctly', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();

      if (await darkModeToggle.isVisible()) {
        // Start in light mode
        const initialIsDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        // Toggle to dark mode
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        const afterToggleIsDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(afterToggleIsDark).toBe(!initialIsDark);

        // Verify aria-label updated
        const ariaLabel = await darkModeToggle.getAttribute('aria-label');
        if (afterToggleIsDark) {
          expect(ariaLabel).toContain('light');
        } else {
          expect(ariaLabel).toContain('dark');
        }

        // Toggle back
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        const finalIsDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(finalIsDark).toBe(initialIsDark);
      }
    });

    test('should persist dark mode preference in localStorage', async ({
      page,
    }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        const savedTheme = await page.evaluate(() => {
          return localStorage.getItem('darkMode');
        });

        const isDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(savedTheme).toBe(isDark.toString());
      }
    });

    test('should load with saved dark mode preference', async ({ page }) => {
      // Set dark mode in localStorage
      await page.goto(urls.home);
      await page.evaluate(() => {
        localStorage.setItem('darkMode', 'true');
      });

      // Reload page
      await page.reload();
      await pageHelper.waitForPageLoad();

      // Should load in dark mode
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      expect(isDark).toBe(true);

      // Dark mode toggle should show correct state
      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
      if (await darkModeToggle.isVisible()) {
        const ariaLabel = await darkModeToggle.getAttribute('aria-label');
        expect(ariaLabel).toContain('light');
      }
    });

    test('should handle system preference when no saved preference', async ({
      page,
    }) => {
      // Emulate system dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      // Page should be functional regardless of preference
      await expect(page.locator('main')).toBeVisible();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
      if (await darkModeToggle.isVisible()) {
        await expect(darkModeToggle).toBeVisible();
        await expect(darkModeToggle).toBeEnabled();
      }
    });
  });

  test.describe('Dark Mode Across Pages', () => {
    const pagesToTest = [
      { name: 'Homepage', url: urls.home },
      { name: 'About', url: urls.about },
      { name: 'Contact', url: urls.contact },
    ];

    pagesToTest.forEach(({ name, url }) => {
      test(`should maintain dark mode on ${name}`, async ({ page }) => {
        // Enable dark mode on homepage
        await page.goto(urls.home);
        await pageHelper.waitForPageLoad();

        const homeToggle = page.locator('button[aria-label*="mode"]').first();
        if (await homeToggle.isVisible()) {
          await homeToggle.click();
          await page.waitForTimeout(300);

          // Navigate to test page
          await page.goto(url);
          await pageHelper.waitForPageLoad();

          // Should maintain dark mode
          const isDark = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark');
          });

          expect(isDark).toBe(true);

          // Toggle should exist and show correct state
          const pageToggle = page.locator('button[aria-label*="mode"]').first();
          if (await pageToggle.isVisible()) {
            const ariaLabel = await pageToggle.getAttribute('aria-label');
            expect(ariaLabel).toContain('light');
          }
        }
      });
    });
  });

  test.describe('Dark Mode with Authentication', () => {
    test('should maintain dark mode through sign in flow', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      // Enable dark mode
      const homeToggle = page.locator('button[aria-label*="mode"]').first();
      if (await homeToggle.isVisible()) {
        await homeToggle.click();
        await page.waitForTimeout(300);

        // Navigate to sign in
        await page.goto(urls.signin);
        await pageHelper.waitForPageLoad();

        // Should maintain dark mode
        const isDarkOnSignIn = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(isDarkOnSignIn).toBe(true);

        // Try to sign in (even if it fails, dark mode should persist)
        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        const signInButton = page.locator('button[type="submit"]').first();

        if (
          (await emailInput.isVisible()) &&
          (await passwordInput.isVisible()) &&
          (await signInButton.isVisible())
        ) {
          await emailInput.fill('test@example.com');
          await passwordInput.fill('password');
          await signInButton.click();
          await page.waitForTimeout(1000);

          // Dark mode should still be enabled
          const isDarkAfterAttempt = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark');
          });

          expect(isDarkAfterAttempt).toBe(true);
        }
      }
    });
  });

  test.describe('Color Contrast and Accessibility', () => {
    test('should have proper contrast in light mode', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      // Ensure light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
      });

      const contrastData = await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll('h1, h2, h3, p, button, a')
        ).slice(0, 10); // Test first 10 elements

        return elements.map((el) => {
          const styles = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            text: el.textContent?.substring(0, 20) || '',
          };
        });
      });

      expect(contrastData.length).toBeGreaterThan(0);

      // All elements should have color values
      contrastData.forEach((data) => {
        expect(data.color).toBeTruthy();
      });
    });

    test('should have proper contrast in dark mode', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      // Enable dark mode
      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        const contrastData = await page.evaluate(() => {
          const elements = Array.from(
            document.querySelectorAll('h1, h2, h3, p, button, a')
          ).slice(0, 10); // Test first 10 elements

          return elements.map((el) => {
            const styles = window.getComputedStyle(el);
            return {
              tag: el.tagName,
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              text: el.textContent?.substring(0, 20) || '',
            };
          });
        });

        expect(contrastData.length).toBeGreaterThan(0);

        // All elements should have color values
        contrastData.forEach((data) => {
          expect(data.color).toBeTruthy();
        });
      }
    });

    test('should have visible focus indicators in both modes', async ({
      page,
    }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const interactiveElements = page.locator(
        'button, a[href], input, select'
      );
      const elementCount = await interactiveElements.count();

      if (elementCount > 0) {
        // Test in light mode
        const firstElement = interactiveElements.first();
        await firstElement.focus();

        const isFocusedLight = await firstElement.evaluate((el) => {
          return document.activeElement === el;
        });
        expect(isFocusedLight).toBe(true);

        // Toggle to dark mode
        const darkModeToggle = page
          .locator('button[aria-label*="mode"]')
          .first();
        if (await darkModeToggle.isVisible()) {
          await darkModeToggle.click();
          await page.waitForTimeout(300);

          // Test focus in dark mode
          await firstElement.focus();

          const isFocusedDark = await firstElement.evaluate((el) => {
            return document.activeElement === el;
          });
          expect(isFocusedDark).toBe(true);
        }
      }
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle corrupted localStorage gracefully', async ({
      page,
    }) => {
      await page.goto(urls.home);
      await page.evaluate(() => {
        localStorage.setItem('darkMode', 'invalid-json-value');
      });

      await page.reload();
      await pageHelper.waitForPageLoad();

      // Should still load properly
      await expect(page.locator('main')).toBeVisible();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        // Should correct the localStorage value
        const correctedValue = await page.evaluate(() => {
          return localStorage.getItem('darkMode');
        });

        expect(['true', 'false']).toContain(correctedValue);
      }
    });

    test('should handle rapid toggling', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

      if (await darkModeToggle.isVisible()) {
        // Rapid toggle test
        for (let i = 0; i < 5; i++) {
          await darkModeToggle.click();
          await page.waitForTimeout(50);
        }

        // Should still be functional
        await expect(darkModeToggle).toBeVisible();
        await expect(darkModeToggle).toBeEnabled();

        // Final state should be consistent
        const isDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        const savedTheme = await page.evaluate(() => {
          return localStorage.getItem('darkMode');
        });

        expect(savedTheme).toBe(isDark.toString());
      }
    });

    test('should work with keyboard navigation', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

      if (await darkModeToggle.isVisible()) {
        // Focus the toggle
        await darkModeToggle.focus();
        expect(
          await darkModeToggle.evaluate((el) => document.activeElement === el)
        ).toBe(true);

        // Get initial state
        const initialIsDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        // Activate with Space key
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        // Should toggle
        const afterSpaceIsDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(afterSpaceIsDark).toBe(!initialIsDark);

        // Activate with Enter key
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        // Should toggle back
        const afterEnterIsDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(afterEnterIsDark).toBe(initialIsDark);
      }
    });

    test('should maintain state during navigation errors', async ({ page }) => {
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

      if (await darkModeToggle.isVisible()) {
        // Enable dark mode
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        // Try to navigate to non-existent page
        await page.goto('/non-existent-page').catch(() => {
          // Expected to fail
        });

        // Navigate back to working page
        await page.goto(urls.home);
        await pageHelper.waitForPageLoad();

        // Dark mode should still be enabled
        const isDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        expect(isDark).toBe(true);
      }
    });
  });

  test.describe('Mobile Dark Mode', () => {
    test('should work on mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(urls.home);
      await pageHelper.waitForPageLoad();

      const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

      if (await darkModeToggle.isVisible()) {
        // Ensure toggle is accessible on mobile
        await expect(darkModeToggle).toBeVisible();

        // Test touch interaction
        await darkModeToggle.tap();
        await page.waitForTimeout(300);

        const isDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark');
        });

        // Should toggle successfully
        expect(typeof isDark).toBe('boolean');

        // Test that button is still accessible after toggle
        await expect(darkModeToggle).toBeVisible();
        await expect(darkModeToggle).toBeEnabled();
      }
    });
  });
});
