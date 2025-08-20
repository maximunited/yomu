// next-intl config for App Router
// https://next-intl.dev/docs/getting-started/app-router
import { getRequestConfig } from "next-intl/server";

export const locales = ["he", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "he";

export default getRequestConfig(() => ({
  locales: Array.from(locales) as unknown as string[],
  defaultLocale,
}));
