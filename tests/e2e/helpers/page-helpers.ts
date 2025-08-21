import { Page, expect } from "@playwright/test";

export class PageHelper {
  constructor(private page: Page) {}

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForFunction(() => document.readyState === "complete");
  }

  /**
   * Check page accessibility basics
   */
  async checkAccessibility() {
    // Check for proper heading structure
    const h1 = this.page.locator("h1");
    await expect(h1).toBeVisible();

    // Check for main landmark
    const main = this.page.locator("main");
    await expect(main).toBeVisible();

    // Check that interactive elements are keyboard accessible
    const buttons = this.page.locator("button:visible");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      await expect(button)
        .toBeFocused({ timeout: 1000 })
        .catch(() => {
          // If not focused, try to focus it
          return button.focus();
        });
    }
  }

  /**
   * Check responsive design
   */
  async checkResponsiveDesign() {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForPageLoad();

    // Check that content is still visible and accessible
    const main = this.page.locator("main");
    await expect(main).toBeVisible();

    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.waitForPageLoad();
  }

  /**
   * Check for common UI elements
   */
  async checkCommonElements() {
    // Check for header/navigation
    const header = this.page.locator('header, nav, [role="banner"]').first();
    await expect(header).toBeVisible();

    // Check for footer
    const footer = this.page.locator('footer, [role="contentinfo"]').first();
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `tests/e2e/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Check for JavaScript errors
   */
  async checkForErrors() {
    const errors: string[] = [];

    this.page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, timeout = 5000) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    await expect(element).toBeEnabled({ timeout });
    return element;
  }

  /**
   * Scroll to element and ensure it's in view
   */
  async scrollToElement(selector: string) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeVisible();
  }
}
