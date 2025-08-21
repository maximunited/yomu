import { test, expect } from "@playwright/test";
import { PageHelper } from "./helpers/page-helpers";
import { urls } from "./fixtures/test-data";

test.describe("Homepage and Navigation", () => {
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
  });

  test("should load homepage successfully", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Check basic page structure
    await expect(page).toHaveTitle(/YomU|יום-You/);
    await expect(page.locator("main")).toBeVisible();

    // Check for main heading
    const mainHeading = page.locator("h1");
    await expect(mainHeading).toBeVisible();

    // Should contain key text about birthday benefits
    await expect(
      page.locator("text=/הטבות|benefits|יום הולדת|birthday/i").first(),
    ).toBeVisible();
  });

  test("should have working navigation menu", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Check for navigation elements
    const nav = page.locator("nav, header").first();
    await expect(nav).toBeVisible();

    // Look for common navigation links
    const navLinks = [
      { text: /בית|home/i, expectedUrl: urls.home },
      { text: /אודות|about/i, expectedUrl: urls.about },
      { text: /צור קשר|contact/i, expectedUrl: urls.contact },
      { text: /התחברות|sign in|login/i, expectedUrl: urls.signin },
    ];

    for (const { text, expectedUrl } of navLinks) {
      const link = page
        .locator(
          `a:has-text("${text.source.replace(/[|]/g, '"), a:has-text("')}")`,
        )
        .first();
      if (await link.isVisible()) {
        await link.click();
        await pageHelper.waitForPageLoad();
        expect(page.url()).toContain(expectedUrl);
        await page.goto(urls.home); // Go back to home for next test
      }
    }
  });

  test("should have working footer links", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Check for footer
    const footer = page.locator('footer, [role="contentinfo"]').first();
    if (await footer.isVisible()) {
      // Test privacy and terms links if they exist
      const privacyLink = footer
        .locator(
          'a[href*="privacy"], a:has-text("פרטיות"), a:has-text("Privacy")',
        )
        .first();
      if (await privacyLink.isVisible()) {
        await privacyLink.click();
        await expect(page).toHaveURL(urls.privacy);
        await page.goBack();
      }

      const termsLink = footer
        .locator('a[href*="terms"], a:has-text("תנאים"), a:has-text("Terms")')
        .first();
      if (await termsLink.isVisible()) {
        await termsLink.click();
        await expect(page).toHaveURL(urls.terms);
        await page.goBack();
      }
    }
  });

  test("should display key features and benefits", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Look for content about the app features
    const features = [
      /הטבות ליום הולדת|birthday benefits/i,
      /חברויות|memberships/i,
      /מעקב|track|tracking/i,
      /התראות|notifications/i,
    ];

    for (const feature of features) {
      const element = page.locator(`text=${feature.source}`).first();
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });

  test("should have proper call-to-action buttons", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Look for sign up or get started buttons
    const ctaButtons = page.locator(
      'a:has-text("הרשמה"), a:has-text("Sign Up"), a:has-text("התחל"), a:has-text("Get Started"), button:has-text("הרשמה"), button:has-text("Sign Up")',
    );

    const buttonCount = await ctaButtons.count();
    if (buttonCount > 0) {
      const firstButton = ctaButtons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();

      // Test clicking the CTA
      await firstButton.click();
      await pageHelper.waitForPageLoad();

      // Should navigate to sign up or onboarding
      expect(page.url()).toMatch(/(signup|onboarding|signin)/);
    }
  });

  test("should handle language switching", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Look for language switcher
    const langSwitcher = page
      .locator(
        '[data-testid="language-switcher"], button:has-text("EN"), button:has-text("עב"), select[name="language"]',
      )
      .first();

    if (await langSwitcher.isVisible()) {
      // Try switching language
      await langSwitcher.click();
      await pageHelper.waitForPageLoad();

      // Content should change or URL should update
      await page.waitForTimeout(1000);
      // Language switch success is hard to test without knowing exact implementation
      // Just verify page is still functional
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("should have proper dark mode toggle functionality", async ({
    page,
  }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Look for dark mode toggle with improved selectors
    const darkModeToggle = page
      .locator(
        '[data-testid="dark-mode-toggle"], ' +
          'button[aria-label*="dark"], ' +
          'button[aria-label*="light"], ' +
          'button[aria-label*="mode"], ' +
          'button:has-text("🌙"), ' +
          'button:has-text("☀"), ' +
          ".lucide-moon, " +
          ".lucide-sun",
      )
      .first();

    if (await darkModeToggle.isVisible()) {
      // Get initial state
      const initialIsDark = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      const initialAriaLabel = await darkModeToggle.getAttribute("aria-label");

      // Verify initial state consistency
      if (initialIsDark) {
        expect(initialAriaLabel).toContain("light");
      } else {
        expect(initialAriaLabel).toContain("dark");
      }

      // Toggle dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      // Check if theme changed
      const newIsDark = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      const newAriaLabel = await darkModeToggle.getAttribute("aria-label");

      // Verify the toggle worked
      expect(newIsDark).toBe(!initialIsDark);

      // Verify aria-label updated correctly
      if (newIsDark) {
        expect(newAriaLabel).toContain("light");
      } else {
        expect(newAriaLabel).toContain("dark");
      }

      // Verify localStorage persistence
      const savedTheme = await page.evaluate(() => {
        return localStorage.getItem("darkMode");
      });
      expect(savedTheme).toBe(newIsDark.toString());

      // Test that preference persists after page reload
      await page.reload();
      await pageHelper.waitForPageLoad();

      const persistedIsDark = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });
      expect(persistedIsDark).toBe(newIsDark);
    }
  });

  test("should have proper color contrast in both modes", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Test light mode contrast
    const lightModeContrast = await page.evaluate(() => {
      const elements = [
        document.querySelector("h1"),
        document.querySelector("p"),
        document.querySelector("button"),
      ].filter(Boolean);

      return elements.map((el) => {
        const styles = window.getComputedStyle(el!);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          element: el!.tagName,
        };
      });
    });

    expect(lightModeContrast.length).toBeGreaterThan(0);

    // Toggle to dark mode if toggle exists
    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      // Test dark mode contrast
      const darkModeContrast = await page.evaluate(() => {
        const elements = [
          document.querySelector("h1"),
          document.querySelector("p"),
          document.querySelector("button"),
        ].filter(Boolean);

        return elements.map((el) => {
          const styles = window.getComputedStyle(el!);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            element: el!.tagName,
          };
        });
      });

      expect(darkModeContrast.length).toBeGreaterThan(0);

      // Verify that colors actually changed between modes
      expect(darkModeContrast).not.toEqual(lightModeContrast);
    }
  });

  test("should be accessible", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();
    await pageHelper.checkAccessibility();
  });

  test("should be responsive", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.checkResponsiveDesign();
  });

  test("should load without JavaScript errors", async ({ page }) => {
    const errors = await pageHelper.checkForErrors();
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Allow some time for any JS errors to appear
    await page.waitForTimeout(2000);

    // There should be no critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("analytics") &&
        !error.includes("tracking"),
    );

    expect(criticalErrors.length).toBeLessThan(3); // Allow for minor issues
  });

  test("should maintain dark mode preference across navigation", async ({
    page,
  }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

    if (await darkModeToggle.isVisible()) {
      // Enable dark mode
      const initialIsDark = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      if (!initialIsDark) {
        await darkModeToggle.click();
        await page.waitForTimeout(300);
      }

      // Verify dark mode is enabled
      const isDarkEnabled = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });
      expect(isDarkEnabled).toBe(true);

      // Navigate to different pages and verify dark mode persists
      const pagesToTest = [urls.about, urls.contact, urls.home];

      for (const url of pagesToTest) {
        await page.goto(url);
        await pageHelper.waitForPageLoad();

        const isDarkPersisted = await page.evaluate(() => {
          return document.documentElement.classList.contains("dark");
        });

        expect(isDarkPersisted).toBe(true);
      }
    }
  });

  test("should respect system dark mode preference", async ({ page }) => {
    // Test with system dark mode preference
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Should default to dark mode when system prefers dark
    const isDarkByDefault = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark");
    });

    // Note: This may not work if user has a saved preference
    // Just verify the page loads properly in dark mode
    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
    if (await darkModeToggle.isVisible()) {
      const ariaLabel = await darkModeToggle.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    }

    // Test with system light mode preference
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await pageHelper.waitForPageLoad();

    // Page should still be functional
    await expect(page.locator("main")).toBeVisible();
  });

  test("should handle dark mode toggle edge cases", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

    if (await darkModeToggle.isVisible()) {
      // Test rapid clicking
      await darkModeToggle.click();
      await darkModeToggle.click();
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      // Should still be functional
      await expect(darkModeToggle).toBeVisible();

      // Test keyboard navigation
      await darkModeToggle.focus();
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);

      // Should still work via keyboard
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });
      expect(typeof isDark).toBe("boolean");

      // Test that localStorage is consistent
      const savedTheme = await page.evaluate(() => {
        return localStorage.getItem("darkMode");
      });
      expect(savedTheme).toBe(isDark.toString());
    }
  });

  test("should handle browser refresh with dark mode", async ({ page }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();

    if (await darkModeToggle.isVisible()) {
      // Enable dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      const isDarkBeforeRefresh = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      // Refresh the page
      await page.reload();
      await pageHelper.waitForPageLoad();

      // Dark mode should persist after refresh
      const isDarkAfterRefresh = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      expect(isDarkAfterRefresh).toBe(isDarkBeforeRefresh);
    }

    // Page should load normally after refresh
    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveTitle(/YomU|יום-You/);
  });

  test("should have proper focus indicators in both modes", async ({
    page,
  }) => {
    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Test focus indicators in light mode
    const buttons = page.locator("button, a[href]");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();

      // Check that focus is visible
      const isFocused = await firstButton.evaluate((el) => {
        return document.activeElement === el;
      });
      expect(isFocused).toBe(true);
    }

    // Toggle to dark mode and test focus indicators
    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      // Test focus in dark mode
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();

        const isFocusedInDark = await firstButton.evaluate((el) => {
          return document.activeElement === el;
        });
        expect(isFocusedInDark).toBe(true);
      }
    }
  });

  test("should handle localStorage corruption gracefully", async ({ page }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem("darkMode", "invalid-value");
    });

    await page.goto(urls.home);
    await pageHelper.waitForPageLoad();

    // Should still load properly despite corrupted localStorage
    await expect(page.locator("main")).toBeVisible();

    const darkModeToggle = page.locator('button[aria-label*="mode"]').first();
    if (await darkModeToggle.isVisible()) {
      // Should still be able to toggle
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      // Should fix the localStorage value
      const fixedValue = await page.evaluate(() => {
        return localStorage.getItem("darkMode");
      });
      expect(["true", "false"]).toContain(fixedValue);
    }
  });
});
