import {
  SUPPORTED_LANGUAGES,
  getAvailableLanguages,
  getFullySupportedLanguages,
  getBetaLanguages,
  isLanguageSupported,
  getLanguageByCode,
  isRTL,
  getDirection,
  detectUserLanguage,
  DEFAULT_LANGUAGE,
} from "@/lib/languages";

describe("languages utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("available languages equals supported entries", () => {
    expect(getAvailableLanguages().length).toBe(
      Object.keys(SUPPORTED_LANGUAGES).length,
    );
  });

  it("fully supported includes he and en only", () => {
    const codes = getFullySupportedLanguages().map((l) => l.code);
    expect(codes).toEqual(expect.arrayContaining(["he", "en"]));
    expect(codes.every((c) => c === "he" || c === "en")).toBe(true);
  });

  it("beta languages are flagged as beta", () => {
    const betas = getBetaLanguages();
    expect(betas.length).toBeGreaterThan(0);
    expect(betas.every((l) => l.isBeta)).toBe(true);
  });

  it("support checks and lookups work", () => {
    expect(isLanguageSupported("he")).toBe(true);
    expect(isLanguageSupported("xx" as any)).toBe(false);
    expect(getLanguageByCode("he")?.code).toBe("he");
    expect(getLanguageByCode("xx")).toBeNull();
  });

  it("direction helpers reflect RTL/LTR", () => {
    expect(isRTL("he")).toBe(true);
    expect(isRTL("en")).toBe(false);
    expect(getDirection("he")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
  });

  it("detectUserLanguage prefers saved language then browser", () => {
    // saved language wins
    localStorage.setItem("language", "en");
    expect(detectUserLanguage()).toBe("en");

    // remove saved, use navigator.language
    localStorage.removeItem("language");
    const originalNavigator = window.navigator;
    Object.defineProperty(window, "navigator", {
      value: { ...originalNavigator, language: "ru-RU", languages: ["ru-RU"] },
    });
    expect(detectUserLanguage()).toBe("ru");

    // unsupported falls back to default
    Object.defineProperty(window, "navigator", {
      value: { ...originalNavigator, language: "xx-XX", languages: ["xx-XX"] },
    });
    expect(detectUserLanguage()).toBe(DEFAULT_LANGUAGE);

    // restore navigator
    Object.defineProperty(window, "navigator", { value: originalNavigator });
  });
});
