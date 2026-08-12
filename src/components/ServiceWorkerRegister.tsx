'use client';

import { useEffect } from 'react';

/**
 * Registers the installable shell SW once in production (or when
 * NEXT_PUBLIC_ENABLE_PWA=1). Scope is honest: offline page only, not catalog.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const enabled =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_PWA === '1';

    if (!enabled) return;

    void navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed', err);
    });
  }, []);

  return null;
}
