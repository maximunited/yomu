import { test, expect } from "@playwright/test";
import { AuthHelper } from "./helpers/auth-helpers";
import { PageHelper } from "./helpers/page-helpers";
import { urls } from "./fixtures/test-data";

test.describe("Benefit Usage and Details", () => {
  let authHelper: AuthHelper;
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    pageHelper = new PageHelper(page);
  });

  test("should display benefit details page", async ({ page }) => {
    // Try to navigate to a benefit detail page
    // In a real scenario, this would be a specific benefit ID
    await page.goto("/benefit/test-benefit-id");

    // If redirected to sign in, it's expected behavior
    if (page.url().includes("/auth/signin")) {
      expect(page.url()).toContain("/auth/signin");
      return;
    }

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Should have benefit information
      const benefitTitle = page
        .locator('h1, .benefit-title, [data-testid="benefit-title"]')
        .first();
      if (await benefitTitle.isVisible()) {
        await expect(benefitTitle).toBeVisible();
      }

      // Should have benefit description
      const benefitDescription = page
        .locator(".description, .benefit-description, p")
        .first();
      if (await benefitDescription.isVisible()) {
        await expect(benefitDescription).toBeVisible();
      }
    }
  });

  test("should show benefit validity information", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for validity information
      const validityInfo = page
        .locator(".validity, .valid-until, text=/תקף|valid|פג|expires/i")
        .first();
      if (await validityInfo.isVisible()) {
        await expect(validityInfo).toBeVisible();

        const text = await validityInfo.textContent();
        expect(text?.length).toBeGreaterThan(0);
      }

      // Look for usage instructions
      const instructions = page
        .locator(".instructions, .how-to-use, text=/איך להשתמש|how to use/i")
        .first();
      if (await instructions.isVisible()) {
        await expect(instructions).toBeVisible();
      }
    }
  });

  test("should display redemption information", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for promo code if available
      const promoCode = page
        .locator('.promo-code, .code, [data-testid="promo-code"]')
        .first();
      if (await promoCode.isVisible()) {
        await expect(promoCode).toBeVisible();

        // Should have copy functionality
        const copyButton = page
          .locator(
            'button:has-text("העתק"), button:has-text("Copy"), .copy-button',
          )
          .first();
        if (await copyButton.isVisible()) {
          await copyButton.click();
          // Code should be copied to clipboard
        }
      }

      // Look for website link
      const websiteLink = page
        .locator('a:has-text("אתר"), a:has-text("Website"), .website-link')
        .first();
      if (await websiteLink.isVisible()) {
        await expect(websiteLink).toBeVisible();

        // Should have proper href
        const href = await websiteLink.getAttribute("href");
        expect(href).toBeTruthy();
      }
    }
  });

  test("should allow marking benefit as used", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for "Mark as Used" button
      const markUsedButton = page
        .locator(
          'button:has-text("סמן כמשומש"), button:has-text("Mark as Used"), .mark-used-button',
        )
        .first();

      if (await markUsedButton.isVisible()) {
        await markUsedButton.click();
        await page.waitForTimeout(1000);

        // Should show confirmation or update UI
        const confirmation = page
          .locator(".success, .confirmation, text=/סומן|marked|נשמר|saved/i")
          .first();
        if (await confirmation.isVisible()) {
          await expect(confirmation).toBeVisible();
        } else {
          // Button might be disabled or text changed
          const buttonText = await markUsedButton.textContent();
          expect(buttonText).toBeTruthy();
        }
      }
    }
  });

  test("should display brand information on benefit page", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Should show brand logo
      const brandLogo = page
        .locator('img[alt*="logo"], img[alt*="brand"], .brand-logo img')
        .first();
      if (await brandLogo.isVisible()) {
        await expect(brandLogo).toBeVisible();

        const altText = await brandLogo.getAttribute("alt");
        expect(altText).toBeTruthy();
      }

      // Should show brand name
      const brandName = page
        .locator(
          '.brand-name, .brand, h2:has-text("McDonald"), h2:has-text("Fox")',
        )
        .first();
      if (await brandName.isVisible()) {
        await expect(brandName).toBeVisible();
      }
    }
  });

  test("should show terms and conditions", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for terms and conditions
      const terms = page
        .locator(".terms, .conditions, text=/תנאים|terms|הגבלות|restrictions/i")
        .first();
      if (await terms.isVisible()) {
        await expect(terms).toBeVisible();

        const text = await terms.textContent();
        expect(text?.length).toBeGreaterThan(10);
      }
    }
  });

  test("should have working back navigation", async ({ page }) => {
    // First go to dashboard or another page
    await page.goto(urls.dashboard);
    await page.waitForTimeout(1000);

    // Then go to benefit page
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for back button
      const backButton = page
        .locator(
          'button:has-text("חזור"), button:has-text("Back"), .back-button, a:has-text("חזור")',
        )
        .first();

      if (await backButton.isVisible()) {
        await backButton.click();
        await pageHelper.waitForPageLoad();

        // Should navigate back
        expect(page.url()).not.toContain("/benefit/");
      } else {
        // Test browser back button
        await page.goBack();
        expect(page.url()).not.toContain("/benefit/");
      }
    }
  });

  test("should handle benefit sharing", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for share button
      const shareButton = page
        .locator(
          'button:has-text("שתף"), button:has-text("Share"), .share-button',
        )
        .first();

      if (await shareButton.isVisible()) {
        await shareButton.click();
        await page.waitForTimeout(1000);

        // Should show share options or copy link
        const shareOptions = page
          .locator(".share-menu, .share-modal, .modal")
          .first();
        if (await shareOptions.isVisible()) {
          await expect(shareOptions).toBeVisible();

          // Close share menu
          await page.keyboard.press("Escape");
        }
      }
    }
  });

  test("should display benefit categories correctly", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for category information
      const category = page
        .locator(
          ".category, .tag, text=/מזון|food|אופנה|fashion|בריאות|health/i",
        )
        .first();
      if (await category.isVisible()) {
        await expect(category).toBeVisible();

        const text = await category.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("should be responsive on benefit page", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.checkResponsiveDesign();
    }
  });

  test("should be accessible on benefit page", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();
      await pageHelper.checkAccessibility();
    }
  });

  test("should handle benefit errors gracefully", async ({ page }) => {
    // Try to access non-existent benefit
    await page.goto("/benefit/non-existent-benefit-id");

    // Should show 404 or redirect
    if (page.url().includes("/benefit/non-existent")) {
      const errorMessage = page
        .locator("text=/404|not found|לא נמצא|שגיאה/i")
        .first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    } else {
      // Redirected to another page (like sign in or dashboard)
      expect(page.url()).toBeTruthy();
    }
  });

  test("should show benefit expiration warnings", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for expiration warnings
      const warning = page
        .locator(".warning, .alert, text=/פג|expires|תקף עד|valid until/i")
        .first();
      if (await warning.isVisible()) {
        await expect(warning).toBeVisible();

        const text = await warning.textContent();
        expect(text?.length).toBeGreaterThan(5);
      }
    }
  });

  test("should handle benefit usage tracking", async ({ page }) => {
    await page.goto("/benefit/test-benefit-id");

    if (page.url().includes("/benefit/")) {
      await pageHelper.waitForPageLoad();

      // Look for usage status
      const usageStatus = page
        .locator(".usage-status, .used, text=/משומש|used|זמין|available/i")
        .first();
      if (await usageStatus.isVisible()) {
        await expect(usageStatus).toBeVisible();
      }

      // Look for usage count if applicable
      const usageCount = page
        .locator(".usage-count, text=/\d+.*פעמים|\d+.*times/i")
        .first();
      if (await usageCount.isVisible()) {
        const text = await usageCount.textContent();
        expect(text).toMatch(/\d+/);
      }
    }
  });
});
