import { renderHook, act } from "@testing-library/react";
import { DarkModeProvider, useDarkMode } from "@/contexts/DarkModeContext";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("DarkModeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    jest.clearAllMocks();
  });

  describe("Toggle Functionality", () => {
    it("toggles dark mode and persists to localStorage", () => {
      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(false);
      });

      expect(result.current.isDarkMode).toBe(false);
      expect(localStorage.getItem("darkMode")).toBe("false");

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(localStorage.getItem("darkMode")).toBe("true");
    });

    it("toggles from light to dark and back", () => {
      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(false);
      });

      expect(result.current.isDarkMode).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(true);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(false);
    });
  });

  describe("Persistence", () => {
    it("loads saved dark mode preference from localStorage", () => {
      localStorage.setItem("darkMode", "true");

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it("loads saved light mode preference from localStorage", () => {
      localStorage.setItem("darkMode", "false");

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);
    });

    it("defaults to system preference when no saved preference", () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it("persists changes to localStorage", () => {
      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(true);
      });

      expect(localStorage.getItem("darkMode")).toBe("true");

      act(() => {
        result.current.setDarkMode(false);
      });

      expect(localStorage.getItem("darkMode")).toBe("false");
    });
  });

  describe("DOM Manipulation", () => {
    it("adds dark class to document element when dark mode is enabled", () => {
      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.setDarkMode(true);
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes dark class from document element when dark mode is disabled", () => {
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
  });

  describe("Error Handling", () => {
    it("throws error when used outside of provider", () => {
      expect(() => {
        renderHook(() => useDarkMode());
      }).toThrow("useDarkMode must be used within a DarkModeProvider");
    });
  });

  describe("System Preference Detection", () => {
    it("respects system dark mode preference", () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it("respects system light mode preference", () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const wrapper = ({ children }: any) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);
    });
  });
});
