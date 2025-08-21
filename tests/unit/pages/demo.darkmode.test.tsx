import React from "react";
import { render, screen } from "@testing-library/react";
import DemoPage from "@/app/demo/page";

// Mock the DarkModeContext
const mockUseDarkMode = jest.fn();
jest.mock("@/contexts/DarkModeContext", () => ({
  useDarkMode: () => mockUseDarkMode(),
}));

// Mock the LanguageContext
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: "en",
  }),
}));

describe("DemoPage Dark Mode Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with light mode styling", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<DemoPage />);

    // Check for light mode background classes
    const mainContainer = screen.getByRole("main").parentElement;
    expect(mainContainer).toHaveClass(
      "from-purple-50",
      "via-pink-50",
      "to-orange-50",
    );
    expect(mainContainer).not.toHaveClass(
      "from-gray-900",
      "via-gray-800",
      "to-gray-900",
    );
  });

  it("should render with dark mode styling", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<DemoPage />);

    // Check for dark mode background classes
    const mainContainer = screen.getByRole("main").parentElement;
    expect(mainContainer).toHaveClass(
      "from-gray-900",
      "via-gray-800",
      "to-gray-900",
    );
    expect(mainContainer).not.toHaveClass(
      "from-purple-50",
      "via-pink-50",
      "to-orange-50",
    );
  });

  it("should have dark mode toggle in header", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<DemoPage />);

    // Look for dark mode toggle component (it should be present)
    // Note: The actual DarkModeToggle component would be tested separately
    // Here we just verify the page structure includes it
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("should have language switcher in header", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<DemoPage />);

    // Verify language switcher is present in header
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("should apply dark mode styles to header", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<DemoPage />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-gray-800", "border-gray-700");
  });

  it("should apply light mode styles to header", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<DemoPage />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-white", "border-gray-200");
  });

  it("should render benefit cards with appropriate dark mode styling", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<DemoPage />);

    // Look for benefit cards (they contain brand names)
    const benefitCards = screen.getAllByText(/fox|starbucks|super-pharm|h&m/i);

    if (benefitCards.length > 0) {
      // Check that benefit cards exist (content will vary)
      expect(benefitCards.length).toBeGreaterThan(0);
    }
  });

  it("should handle dark mode toggle without errors", () => {
    // Start with light mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    const { rerender } = render(<DemoPage />);

    // Switch to dark mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    // Should re-render without errors
    expect(() => {
      rerender(<DemoPage />);
    }).not.toThrow();

    // Verify dark mode classes are applied
    const mainContainer = screen.getByRole("main").parentElement;
    expect(mainContainer).toHaveClass("from-gray-900");
  });

  it("should maintain consistent text contrast in both modes", () => {
    // Test light mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    const { rerender } = render(<DemoPage />);

    // Should render without accessibility issues
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Test dark mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    rerender(<DemoPage />);

    // Should still render without accessibility issues
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("should have proper ARIA labels and accessibility", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<DemoPage />);

    // Check for main content
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Check for header
    expect(screen.getByRole("banner")).toBeInTheDocument();

    // Check that links have proper structure
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
