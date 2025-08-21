import { renderHook, act } from "@testing-library/react";
import { DarkModeProvider, useDarkMode } from "@/contexts/DarkModeContext";

// Mock window.matchMedia with different system preferences
const createMockMatchMedia = (prefersDark: boolean) => {
  return jest.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe("DarkModeContext System Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    jest.clearAllMocks();
  });

  describe("System Preference Detection", () => {
    it("defaults to system prefers dark when no saved setting", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: createMockMatchMedia(true),
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it("respects system light mode preference when no localStorage", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: createMockMatchMedia(false),
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);
    });

    it("overrides system preference with localStorage value", () => {
      localStorage.setItem("darkMode", "false");

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: createMockMatchMedia(true), // System prefers dark
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      // Should use localStorage value, not system preference
      expect(result.current.isDarkMode).toBe(false);
    });
  });

  describe("DOM Class Management", () => {
    it("applies dark class to document element", () => {
      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(true);
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes dark class from document element", () => {
      // Start with dark class
      document.documentElement.classList.add("dark");

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(false);
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("only modifies dark class, leaves other classes intact", () => {
      document.documentElement.classList.add("existing-class", "another-class");

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(true);
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(
        document.documentElement.classList.contains("existing-class"),
      ).toBe(true);
      expect(document.documentElement.classList.contains("another-class")).toBe(
        true,
      );

      act(() => {
        result.current.setDarkMode(false);
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(
        document.documentElement.classList.contains("existing-class"),
      ).toBe(true);
      expect(document.documentElement.classList.contains("another-class")).toBe(
        true,
      );
    });
  });

  describe("Error Recovery", () => {
    it("recovers from localStorage errors", () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error("localStorage error");
      });

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: createMockMatchMedia(false),
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );

      expect(() => {
        renderHook(() => useDarkMode(), { wrapper });
      }).not.toThrow();

      // Restore localStorage
      localStorage.getItem = originalGetItem;
    });

    it("handles corrupted localStorage values", () => {
      // Set invalid localStorage value
      localStorage.setItem("darkMode", "invalid-boolean-value");

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: createMockMatchMedia(true),
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      // Should fall back to system preference after cleaning up invalid value
      expect(result.current.isDarkMode).toBe(true);

      // Invalid localStorage value should be removed
      expect(localStorage.getItem("darkMode")).toBeNull();

      // Should be able to toggle and set new valid localStorage
      act(() => {
        result.current.setDarkMode(false);
      });

      expect(localStorage.getItem("darkMode")).toBe("false");
    });
  });

  describe("Browser Compatibility", () => {
    it("works when matchMedia is not supported", () => {
      // Simulate old browser without matchMedia
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: undefined,
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );

      const { result } = renderHook(() => useDarkMode(), { wrapper });

      // Should not throw and should default to light mode
      expect(result.current.isDarkMode).toBe(false);
      expect(typeof result.current.toggleDarkMode).toBe("function");
    });

    it("works with mocked matchMedia", () => {
      // Common test setup where matchMedia is mocked
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);
    });
  });
});
