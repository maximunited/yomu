export type LanguageCode =
  | "he"
  | "en"
  | "ar"
  | "ru"
  | "fr"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "ja"
  | "ko"
  | "zh";

export interface LanguageInfo {
  code: LanguageCode;
  name: string; // Native name
  englishName: string; // Name in English
  flag: string; // Flag emoji or icon
  dir: "rtl" | "ltr";
  isRTL: boolean;
  isDefault?: boolean;
  isBeta?: boolean; // For languages that are partially translated
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  he: {
    code: "he",
    name: "עברית",
    englishName: "Hebrew",
    flag: "🇮🇱",
    dir: "rtl",
    isRTL: true,
    isDefault: true,
  },
  en: {
    code: "en",
    name: "English",
    englishName: "English",
    flag: "🇺🇸",
    dir: "ltr",
    isRTL: false,
  },
  ar: {
    code: "ar",
    name: "العربية",
    englishName: "Arabic",
    flag: "🇸🇦",
    dir: "rtl",
    isRTL: true,
    isBeta: true,
  },
  ru: {
    code: "ru",
    name: "Русский",
    englishName: "Russian",
    flag: "🇷🇺",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  fr: {
    code: "fr",
    name: "Français",
    englishName: "French",
    flag: "🇫🇷",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  es: {
    code: "es",
    name: "Español",
    englishName: "Spanish",
    flag: "🇪🇸",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  de: {
    code: "de",
    name: "Deutsch",
    englishName: "German",
    flag: "🇩🇪",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  it: {
    code: "it",
    name: "Italiano",
    englishName: "Italian",
    flag: "🇮🇹",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  pt: {
    code: "pt",
    name: "Português",
    englishName: "Portuguese",
    flag: "🇵🇹",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  ja: {
    code: "ja",
    name: "日本語",
    englishName: "Japanese",
    flag: "🇯🇵",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  ko: {
    code: "ko",
    name: "한국어",
    englishName: "Korean",
    flag: "🇰🇷",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
  zh: {
    code: "zh",
    name: "中文",
    englishName: "Chinese",
    flag: "🇨🇳",
    dir: "ltr",
    isRTL: false,
    isBeta: true,
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = "he";

export function getLanguageInfo(code: LanguageCode): LanguageInfo {
  return SUPPORTED_LANGUAGES[code];
}

export function getAvailableLanguages(): LanguageInfo[] {
  return Object.values(SUPPORTED_LANGUAGES);
}

export function getFullySupportedLanguages(): LanguageInfo[] {
  return getAvailableLanguages().filter((lang) => !lang.isBeta);
}

export function getBetaLanguages(): LanguageInfo[] {
  return getAvailableLanguages().filter((lang) => lang.isBeta);
}

export function isLanguageSupported(code: string): code is LanguageCode {
  return code in SUPPORTED_LANGUAGES;
}

export function getLanguageByCode(code: string): LanguageInfo | null {
  if (isLanguageSupported(code)) {
    return SUPPORTED_LANGUAGES[code];
  }
  return null;
}

// Language detection utilities
export function detectUserLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  // Check localStorage first
  const savedLanguage = localStorage.getItem("language") as LanguageCode;
  if (savedLanguage && isLanguageSupported(savedLanguage)) {
    return savedLanguage;
  }

  // Check browser language
  const browserLanguage = navigator.language.split("-")[0];
  if (isLanguageSupported(browserLanguage)) {
    return browserLanguage as LanguageCode;
  }

  // Check for RTL languages in browser
  const browserLanguages = navigator.languages || [navigator.language];
  for (const lang of browserLanguages) {
    const langCode = lang.split("-")[0];
    if (isLanguageSupported(langCode)) {
      return langCode as LanguageCode;
    }
  }

  return DEFAULT_LANGUAGE;
}

// Direction utilities
export function isRTL(code: LanguageCode): boolean {
  return SUPPORTED_LANGUAGES[code].isRTL;
}

export function getDirection(code: LanguageCode): "rtl" | "ltr" {
  return SUPPORTED_LANGUAGES[code].dir;
}
