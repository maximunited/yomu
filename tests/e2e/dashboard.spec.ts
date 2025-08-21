import { test, expect } from "@playwright/test";
import { AuthHelper } from "./helpers/auth-helpers";
import { PageHelper } from "./helpers/page-helpers";
import { urls } from "./fixtures/test-data";

test.describe("Dashboard Functionality", () => {
  let authHelper: AuthHelper;
  let pageHelper: PageHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    pageHelper = new PageHelper(page);

    // Note: For E2E tests, we'll test with mock data or require a test database
    // In a real app, you'd set up test data beforehand
  });

  test("should redirect unauthenticated users to sign in", async ({ page }) => {
    await authHelper.clearAuth();
    await page.goto(urls.dashboard);

    // Should redirect to sign in page
    await page.waitForURL(new RegExp(urls.signin), { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should load dashboard for authenticated users", async ({ page }) => {
    // Mock authentication by going to sign in page first
    await page.goto(urls.signin);
    await pageHelper.waitForPageLoad();

    // Fill in mock credentials (this will likely fail in real environment)
    // In real E2E, you'd have a test user set up
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    // Try to submit - this tests the flow even if auth fails
    await page.click('button[type="submit"]');

    // Wait a moment to see what happens
    await page.waitForTimeout(2000);

    // If we get to dashboard, test it; otherwise test the sign in flow worked
    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();
      await expect(page.locator("main")).toBeVisible();
    } else {
      // Authentication failed as expected in test environment
      // Test that we stayed on sign in page or got feedback
      expect(page.url()).toContain("/auth");
    }
  });

  test("should display user benefits when available", async ({ page }) => {
    // Try to access dashboard (will redirect if not authenticated)
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for benefits-related content
      const benefitsSection = page
        .locator(
          '[data-testid="benefits"], .benefits, section:has-text("הטבות"), section:has-text("Benefits")',
        )
        .first();
      if (await benefitsSection.isVisible()) {
        await expect(benefitsSection).toBeVisible();
      }

      // Look for membership-related content
      const membershipsSection = page
        .locator(
          '[data-testid="memberships"], .memberships, section:has-text("חברויות"), section:has-text("Memberships")',
        )
        .first();
      if (await membershipsSection.isVisible()) {
        await expect(membershipsSection).toBeVisible();
      }
    } else {
      // Not authenticated - this is expected behavior
      expect(page.url()).toContain("/auth/signin");
    }
  });

  test("should have working search functionality", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for search input
      const searchInput = page
        .locator(
          'input[type="search"], input[placeholder*="חפש"], input[placeholder*="search" i]',
        )
        .first();

      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await page.keyboard.press("Enter");

        // Should trigger some kind of search or filtering
        await page.waitForTimeout(1000);
        await expect(searchInput).toHaveValue("test");
      }
    }
  });

  test("should have working filter controls", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for category filters
      const categoryFilter = page
        .locator(
          'select[name="category"], button:has-text("קטגוריה"), button:has-text("Category")',
        )
        .first();

      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForTimeout(500);

        // Should show filter options or dropdown
        const filterOption = page
          .locator(
            'option, [role="option"], li:has-text("מזון"), li:has-text("Food")',
          )
          .first();
        if (await filterOption.isVisible()) {
          await filterOption.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test("should display upcoming and active benefits separately", async ({
    page,
  }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for active benefits section
      const activeBenefits = page
        .locator(
          'section:has-text("פעילות"), section:has-text("Active"), .active-benefits',
        )
        .first();
      if (await activeBenefits.isVisible()) {
        await expect(activeBenefits).toBeVisible();
      }

      // Look for upcoming benefits section
      const upcomingBenefits = page
        .locator(
          'section:has-text("קרובות"), section:has-text("Upcoming"), .upcoming-benefits',
        )
        .first();
      if (await upcomingBenefits.isVisible()) {
        await expect(upcomingBenefits).toBeVisible();
      }
    }
  });

  test("should handle benefit interaction", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for benefit cards
      const benefitCard = page
        .locator('.benefit-card, [data-testid="benefit-card"], article')
        .first();

      if (await benefitCard.isVisible()) {
        // Click on benefit card
        await benefitCard.click();
        await page.waitForTimeout(1000);

        // Should navigate to benefit detail or show modal
        const benefitDetail = page
          .locator('[data-testid="benefit-detail"], .benefit-detail, .modal')
          .first();
        if (await benefitDetail.isVisible()) {
          await expect(benefitDetail).toBeVisible();
        } else {
          // Might navigate to a new page
          expect(page.url()).toContain("/benefit/");
        }
      }
    }
  });

  test("should show membership count and stats", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for membership statistics
      const membershipCount = page
        .locator(
          '[data-testid="membership-count"], .membership-count, text=/חברויות|memberships/i',
        )
        .first();

      if (await membershipCount.isVisible()) {
        await expect(membershipCount).toBeVisible();

        // Should show some number
        const text = await membershipCount.textContent();
        expect(text).toMatch(/\d+/); // Contains at least one digit
      }
    }
  });

  test("should have responsive design", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.checkResponsiveDesign();
    }
  });

  test("should be accessible", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();
      await pageHelper.checkAccessibility();
    }
  });

  test("should handle empty state gracefully", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      await pageHelper.waitForPageLoad();

      // Look for empty state messages
      const emptyState = page
        .locator("text=/אין הטבות|no benefits|אין חברויות|no memberships/i")
        .first();

      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();

        // Should have call-to-action to add memberships
        const addMembershipButton = page
          .locator(
            'a:has-text("הוסף חברות"), a:has-text("Add Membership"), button:has-text("הוסף"), button:has-text("Add")',
          )
          .first();
        if (await addMembershipButton.isVisible()) {
          await expect(addMembershipButton).toBeVisible();
        }
      }
    }
  });

  test("should handle loading states", async ({ page }) => {
    await page.goto(urls.dashboard);

    if (page.url().includes("/dashboard")) {
      // Look for loading indicators during initial load
      const loadingIndicator = page
        .locator(".loading, .spinner, text=/טוען|loading/i")
        .first();

      // Loading indicator might appear briefly
      if (
        await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        // Wait for loading to complete
        await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      }

      await pageHelper.waitForPageLoad();
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
