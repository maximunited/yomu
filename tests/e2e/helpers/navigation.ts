import { Page } from '@playwright/test';

function pathMatches(url: string, path: string): boolean {
  try {
    const { pathname } = new URL(url);
    if (path === '/' || path === '') {
      return pathname === '/';
    }
    return pathname.includes(path.replace(/^\//, '').split('?')[0]);
  } catch {
    return false;
  }
}

/**
 * WebKit/Clerk often interrupt goto(A) with another client navigation.
 * If we already landed on the target (or same-origin home), treat as success.
 */
export async function safeGoto(page: Page, path: string) {
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch {
    if (pathMatches(page.url(), path)) {
      await page.waitForLoadState('domcontentloaded').catch(() => undefined);
      return;
    }
    await page.waitForTimeout(300);
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
}
