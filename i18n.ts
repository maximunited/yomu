// next-intl config for App Router
// https://next-intl.dev/docs/getting-started/app-router
import { getRequestConfig } from 'next-intl/server';

export const locales = ['he', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'he';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || defaultLocale;
  return {
    locale,
    messages: (await import(`./src/i18n/messages`)).getMessages(
      locale as Locale
    ),
  };
});
