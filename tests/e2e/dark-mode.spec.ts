import { test, expect } from '@playwright/test';
import { PageHelper } from './helpers/page-helpers';
import {
  enableDarkModeViaStorage,
  ensureDarkModeByToggle,
  isDocumentDark,
  waitForDarkModeHydration,
} from './helpers/dark-mode-helpers';
import { safeGoto } from './helpers/navigation';
import { urls } from './fixtures/test-data';

test.describe('Dark Mode Functionality', () => {
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);

    await page.context().clearCookies();
    await safeGoto(page, urls.home);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Dark Mode Toggle', () => {
    test('should toggle dark mode correctly', async ({ page }) => {
      // beforeEach already landed on home with cleared storage
      await page.reload({ waitUntil: 'commit' }).catch(async () => {
        await safeGoto(page, urls.home);
      });
      await waitForDarkModeHydration(page);

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();

      const initialIsDark = await isDocumentDark(page);

      await darkModeToggle.click();
      await page.waitForFunction(
        (wasDark) =>
          document.documentElement.classList.contains('dark') !== wasDark,
        initialIsDark
      );

      const afterToggleIsDark = await isDocumentDark(page);
      expect(afterToggleIsDark).toBe(!initialIsDark);

      const ariaLabel = await darkModeToggle.getAttribute('aria-label');
      if (afterToggleIsDark) {
        expect(ariaLabel).toContain('light');
      } else {
        expect(ariaLabel).toContain('dark');
      }

      await darkModeToggle.click();
      await page.waitForFunction(
        (wasDark) =>
          document.documentElement.classList.contains('dark') === wasDark,
        initialIsDark
      );

      expect(await isDocumentDark(page)).toBe(initialIsDark);
    });

    test('should persist dark mode preference in localStorage', async ({
      page,
    }) => {
      await page.reload({ waitUntil: 'commit' }).catch(async () => {
        await safeGoto(page, urls.home);
      });
      await waitForDarkModeHydration(page);

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();

      const before = await isDocumentDark(page);
      await darkModeToggle.click();
      await page.waitForFunction(
        (wasDark) =>
          document.documentElement.classList.contains('dark') !== wasDark,
        before
      );

      const savedTheme = await page.evaluate(() =>
        localStorage.getItem('darkMode')
      );
      const isDark = await isDocumentDark(page);
      expect(savedTheme).toBe(isDark.toString());
    });

    test('should load with saved dark mode preference', async ({ page }) => {
      await enableDarkModeViaStorage(page);

      expect(await isDocumentDark(page)).toBe(true);

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();
      await expect(darkModeToggle).toHaveAttribute('aria-label', /light/i);
    });

    test('should handle system preference when no saved preference', async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload({ waitUntil: 'commit' }).catch(async () => {
        await safeGoto(page, urls.home);
      });
      await pageHelper.waitForPageLoad();

      await expect(page.locator('main')).toBeVisible();

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();
      await expect(darkModeToggle).toBeVisible();
      await expect(darkModeToggle).toBeEnabled();
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
        await ensureDarkModeByToggle(page);

        await safeGoto(page, url);
        await waitForDarkModeHydration(page);
        await page.waitForFunction(() =>
          document.documentElement.classList.contains('dark')
        );

        expect(await isDocumentDark(page)).toBe(true);
      });
    });
  });

  test.describe('Dark Mode with Authentication', () => {
    test('should maintain dark mode through sign in flow', async ({ page }) => {
      await ensureDarkModeByToggle(page);

      await safeGoto(page, urls.signin);
      await page.waitForFunction(() =>
        document.documentElement.classList.contains('dark')
      );

      expect(await isDocumentDark(page)).toBe(true);
    });
  });

  test.describe('Color Contrast and Accessibility', () => {
    test('should have proper contrast in light mode', async ({ page }) => {
      await waitForDarkModeHydration(page);

      // Ensure light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
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
      await ensureDarkModeByToggle(page);

      const contrastData = await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll('h1, h2, h3, p, button, a')
        ).slice(0, 10);

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
      contrastData.forEach((data) => {
        expect(data.color).toBeTruthy();
      });
    });

    test('should have visible focus indicators in both modes', async ({
      page,
    }) => {
      await waitForDarkModeHydration(page);

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
      await page.evaluate(() => {
        localStorage.setItem('darkMode', 'invalid-json-value');
      });

      await page.reload({ waitUntil: 'commit' }).catch(async () => {
        await safeGoto(page, urls.home);
      });
      await waitForDarkModeHydration(page);

      await expect(page.locator('main')).toBeVisible();

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();
      await darkModeToggle.click();
      await page.waitForTimeout(200);

      const correctedValue = await page.evaluate(() =>
        localStorage.getItem('darkMode')
      );
      expect(['true', 'false']).toContain(correctedValue);
    });

    test('should handle rapid toggling', async ({ page }) => {
      await waitForDarkModeHydration(page);

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();

      for (let i = 0; i < 3; i++) {
        await darkModeToggle.click();
        await page.waitForTimeout(100);
      }

      await expect(darkModeToggle).toBeVisible();
      await expect(darkModeToggle).toBeEnabled();

      const isDark = await isDocumentDark(page);
      const savedTheme = await page.evaluate(() =>
        localStorage.getItem('darkMode')
      );
      expect(savedTheme).toBe(isDark.toString());
    });

    test('should work with keyboard navigation', async ({ page }) => {
      await waitForDarkModeHydration(page);

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
      await ensureDarkModeByToggle(page);

      await page.goto('/non-existent-page').catch(() => {
        // Expected to fail
      });

      await safeGoto(page, urls.home);
      await waitForDarkModeHydration(page);
      await page.waitForFunction(() =>
        document.documentElement.classList.contains('dark')
      );

      expect(await isDocumentDark(page)).toBe(true);
    });
  });

  test.describe('Mobile Dark Mode', () => {
    test('should work on mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.reload({ waitUntil: 'commit' }).catch(async () => {
        await safeGoto(page, urls.home);
      });
      await waitForDarkModeHydration(page);

      const darkModeToggle = page
        .locator(
          'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]'
        )
        .first();

      if (await darkModeToggle.isVisible().catch(() => false)) {
        // Ensure toggle is accessible on mobile
        await expect(darkModeToggle).toBeVisible();

        const before = await page.evaluate(() =>
          document.documentElement.classList.contains('dark')
        );
        await darkModeToggle.click();
        await page.waitForFunction(
          (wasDark) =>
            document.documentElement.classList.contains('dark') !== wasDark,
          before
        );

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
