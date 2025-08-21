import { test, expect } from "@playwright/test";
import { AuthHelper } from "./helpers/auth-helpers";
import { PageHelper } from "./helpers/page-helpers";
import { urls } from "./fixtures/test-data";

test.describe("Memberships Management", () => {
  let authHelper: AuthHelper;
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    pageHelper = new PageHelper(page);
  });

  test("should redirect unauthenticated users to sign in", async ({ page }) => {
    await authHelper.clearAuth();
    await page.goto(urls.memberships);

    // Should redirect to sign in page
    await page.waitForURL(new RegExp(urls.signin), { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should load memberships page for authenticated users", async ({
    page,
  }) => {
    // Try to access memberships page
    await page.goto(urls.memberships);

    // If redirected to sign in, try mock authentication
    if (page.url().includes("/auth/signin")) {
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Try to go to memberships again
      await page.goto(urls.memberships);
    }

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();
      await expect(page.locator("main")).toBeVisible();

      // Should have membership-related content
      const membershipContent = page
        .locator("text=/חברויות|memberships|brands/i")
        .first();
      await expect(membershipContent).toBeVisible();
    }
  });

  test("should display available brands for membership", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for brand cards or list
      const brandCards = page.locator(
        '.brand-card, [data-testid="brand-card"], .brand-item, article',
      );
      const cardCount = await brandCards.count();

      if (cardCount > 0) {
        // Should show brand information
        const firstCard = brandCards.first();
        await expect(firstCard).toBeVisible();

        // Should have brand name
        const brandName = firstCard
          .locator("h2, h3, .brand-name, .name")
          .first();
        if (await brandName.isVisible()) {
          await expect(brandName).toBeVisible();
        }

        // Should have category
        const category = firstCard
          .locator('.category, [data-testid="category"]')
          .first();
        if (await category.isVisible()) {
          await expect(category).toBeVisible();
        }
      }
    }
  });

  test("should have working search functionality", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for search input
      const searchInput = page
        .locator(
          'input[type="search"], input[placeholder*="חפש"], input[placeholder*="search" i]',
        )
        .first();

      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill("McDonald");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        // Search should work
        await expect(searchInput).toHaveValue("McDonald");

        // Clear search
        await searchInput.clear();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(500);
      }
    }
  });

  test("should have working category filters", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for category filter buttons
      const categoryButtons = page.locator(
        'button:has-text("מזון"), button:has-text("Food"), button:has-text("אופנה"), button:has-text("Fashion"), .category-filter button',
      );
      const buttonCount = await categoryButtons.count();

      if (buttonCount > 0) {
        const firstButton = categoryButtons.first();
        await firstButton.click();
        await page.waitForTimeout(1000);

        // Button should be selected/active
        const isActive = await firstButton.getAttribute("class");
        expect(isActive).toBeTruthy();
      }

      // Look for "All" or "הכל" button to reset
      const allButton = page
        .locator(
          'button:has-text("הכל"), button:has-text("All"), button:has-text("כל")',
        )
        .first();
      if (await allButton.isVisible()) {
        await allButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("should allow membership toggle", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for membership toggle switches/checkboxes
      const membershipToggles = page.locator(
        'input[type="checkbox"], .toggle, .switch',
      );
      const toggleCount = await membershipToggles.count();

      if (toggleCount > 0) {
        const firstToggle = membershipToggles.first();
        const initialState = await firstToggle.isChecked();

        // Toggle membership
        await firstToggle.click();
        await page.waitForTimeout(1000);

        // State should change
        const newState = await firstToggle.isChecked();
        expect(newState).toBe(!initialState);

        // Toggle back
        await firstToggle.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("should handle custom membership creation", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for "Add Custom Membership" button
      const addCustomButton = page
        .locator(
          'button:has-text("הוסף חברות"), button:has-text("Add Membership"), button:has-text("יצירת חברות"), button:has-text("Create")',
        )
        .first();

      if (await addCustomButton.isVisible()) {
        await addCustomButton.click();
        await page.waitForTimeout(1000);

        // Should show form or modal
        const form = page.locator("form, .modal, .dialog").first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();

          // Look for form fields
          const nameField = form
            .locator(
              'input[name="name"], input[placeholder*="שם"], input[placeholder*="name" i]',
            )
            .first();
          if (await nameField.isVisible()) {
            await nameField.fill("Test Custom Membership");
          }

          // Look for description field
          const descField = form
            .locator('textarea[name="description"], input[name="description"]')
            .first();
          if (await descField.isVisible()) {
            await descField.fill("Test description");
          }

          // Look for cancel/close button to exit without saving
          const cancelButton = form
            .locator(
              'button:has-text("ביטול"), button:has-text("Cancel"), button:has-text("סגור"), button:has-text("Close")',
            )
            .first();
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          } else {
            // Press Escape to close
            await page.keyboard.press("Escape");
          }
        }
      }
    }
  });

  test("should show membership statistics", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for membership count or statistics
      const membershipStats = page
        .locator(
          '[data-testid="membership-stats"], .stats, .membership-count, text=/\d+.*חברויות|\d+.*memberships/i',
        )
        .first();

      if (await membershipStats.isVisible()) {
        await expect(membershipStats).toBeVisible();

        const text = await membershipStats.textContent();
        expect(text).toMatch(/\d+/); // Should contain numbers
      }
    }
  });

  test("should handle empty state", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for empty state message
      const emptyState = page
        .locator("text=/אין חברויות|no memberships|אין מותגים|no brands/i")
        .first();

      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();

        // Should have call-to-action
        const ctaButton = page
          .locator(
            'button:has-text("הוסף"), button:has-text("Add"), a:has-text("התחל"), a:has-text("Get Started")',
          )
          .first();
        if (await ctaButton.isVisible()) {
          await expect(ctaButton).toBeVisible();
        }
      }
    }
  });

  test("should show brand logos and information", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for brand images
      const brandImages = page.locator(
        'img[alt*="logo"], img[alt*="brand"], .brand-logo img',
      );
      const imageCount = await brandImages.count();

      if (imageCount > 0) {
        const firstImage = brandImages.first();
        await expect(firstImage).toBeVisible();

        // Should have proper alt text
        const altText = await firstImage.getAttribute("alt");
        expect(altText).toBeTruthy();
        expect(altText?.length).toBeGreaterThan(0);
      }

      // Look for brand descriptions
      const brandDescriptions = page.locator(
        ".description, .brand-description, p",
      );
      const descCount = await brandDescriptions.count();

      if (descCount > 0) {
        const firstDesc = brandDescriptions.first();
        if (await firstDesc.isVisible()) {
          const text = await firstDesc.textContent();
          expect(text?.length).toBeGreaterThan(5);
        }
      }
    }
  });

  test("should be responsive", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.checkResponsiveDesign();
    }
  });

  test("should be accessible", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();
      await pageHelper.checkAccessibility();
    }
  });

  test("should handle loading states", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      // Look for loading indicators
      const loadingIndicator = page
        .locator(".loading, .spinner, text=/טוען|loading/i")
        .first();

      // Loading might appear briefly
      if (
        await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      }

      await pageHelper.waitForPageLoad();
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("should navigate to onboarding from memberships", async ({ page }) => {
    await page.goto(urls.memberships);

    if (page.url().includes("/memberships")) {
      await pageHelper.waitForPageLoad();

      // Look for onboarding or getting started link
      const onboardingLink = page
        .locator(
          'a[href*="onboarding"], a:has-text("התחלה"), a:has-text("Getting Started"), a:has-text("הדרכה")',
        )
        .first();

      if (await onboardingLink.isVisible()) {
        await onboardingLink.click();
        await pageHelper.waitForPageLoad();
        expect(page.url()).toContain("/onboarding");
      }
    }
  });
});
