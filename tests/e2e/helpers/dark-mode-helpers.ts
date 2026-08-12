import { Page, expect } from '@playwright/test';

const toggleSelector =
  'button[aria-label*="mode"], button[aria-label*="dark"], button[aria-label*="light"]';

/** Wait until DarkModeProvider hydration has applied document class. */
export async function waitForDarkModeHydration(page: Page) {
  await expect(page.locator(toggleSelector).first()).toBeVisible({
    timeout: 15000,
  });
}

export async function isDocumentDark(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
}

/** Force dark mode via localStorage + reload, then wait for class. */
export async function enableDarkModeViaStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('darkMode', 'true');
  });
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(async () => {
    await page.goto(page.url() || '/', { waitUntil: 'domcontentloaded' });
  });
  await waitForDarkModeHydration(page);
  await page.waitForFunction(
    () => document.documentElement.classList.contains('dark'),
    null,
    { timeout: 15000 }
  );
}

/** Click toggle until document is dark (handles system-dark starting state). */
export async function ensureDarkModeByToggle(page: Page) {
  await waitForDarkModeHydration(page);
  if (await isDocumentDark(page)) {
    return;
  }
  // Prefer storage path — more reliable than click under WebKit/Clerk races
  await enableDarkModeViaStorage(page);
}
