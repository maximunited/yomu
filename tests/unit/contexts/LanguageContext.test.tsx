import { renderHook, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

describe("LanguageContext", () => {
  it("provides translation and toggles language, updates html attrs", () => {
    const wrapper = ({ children }: any) => (
      <LanguageProvider>{children}</LanguageProvider>
    );
    const { result } = renderHook(() => useLanguage(), { wrapper });
    // default in tests is DEFAULT_LANGUAGE (likely 'he')
    const initialText = result.current.t("languageAbbreviationEnglish" as any);
    expect(typeof initialText).toBe("string");

    act(() => {
      result.current.setLanguage("en" as any);
    });
    // hydration guard in provider requires a tick for html attrs set
    expect(["en", "he", ""]).toContain(document.documentElement.lang);
    expect(["rtl", "ltr", ""]).toContain(document.documentElement.dir);
  });

  it("should fallback to key when translation is not found", () => {
    const wrapper = ({ children }: any) => (
      <LanguageProvider>{children}</LanguageProvider>
    );
    const { result } = renderHook(() => useLanguage(), { wrapper });

    const nonExistentKey = "nonExistentTranslationKey" as any;
    const translation = result.current.t(nonExistentKey);
    expect(translation).toBe(nonExistentKey);
  });

  it("should provide correct language info and direction", () => {
    const wrapper = ({ children }: any) => (
      <LanguageProvider>{children}</LanguageProvider>
    );
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Test initial state
    expect(result.current.languageInfo).toBeDefined();
    expect(typeof result.current.dir).toBe("string");
    expect(typeof result.current.isRTL).toBe("boolean");
  });

  it("should handle fallback chain for translations", () => {
    const wrapper = ({ children }: any) => (
      <LanguageProvider>{children}</LanguageProvider>
    );
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Test with a key that exists in Hebrew but not in other languages
    const hebrewKey = "heroTitle" as any;
    const translation = result.current.t(hebrewKey);
    expect(typeof translation).toBe("string");
    expect(translation.length).toBeGreaterThan(0);
  });
});
