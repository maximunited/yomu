import { translations } from "@/lib/translations";

export type SupportedLocale = keyof typeof translations;

export function getMessages(locale: SupportedLocale) {
  // Cast through unknown to satisfy linter when passing into i18n provider
  return translations[locale] as unknown as Record<string, unknown>;
}

export const DEFAULT_LOCALE: SupportedLocale = "he";
