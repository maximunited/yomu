// Minimal next-intl config for App Router
// See: https://next-intl.dev/docs/getting-started/app-router

export const locales = ['he', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'he';


