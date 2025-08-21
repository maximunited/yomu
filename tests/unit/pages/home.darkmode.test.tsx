import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

// Mock the DarkModeContext
const mockUseDarkMode = jest.fn();
jest.mock("@/contexts/DarkModeContext", () => ({
  useDarkMode: () => mockUseDarkMode(),
}));

// Mock the LanguageContext
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        heroTitle: "Never Miss a Birthday Deal Again",
        heroDescription:
          "Track your birthday benefits from all your favorite brands in one place",
        feature1Title: "Track Benefits",
        feature1Description: "Keep track of all your birthday benefits",
        feature2Title: "Never Miss",
        feature2Description: "Get reminded when your benefits are active",
        feature3Title: "Save Money",
        feature3Description: "Make the most of your special day",
        statsBrands: "Brands",
        statsBenefits: "Benefits",
        statsUsers: "Users",
        statsSaved: "Saved",
        signIn: "Sign In",
        signUp: "Sign Up",
        getStarted: "Get Started",
        learnMore: "Learn More",
        allRightsReserved: "All rights reserved",
        about: "About",
        privacy: "Privacy",
        terms: "Terms",
        contact: "Contact",
      };
      return translations[key] || key;
    },
    language: "en",
  }),
}));

describe("HomePage Hero Title Dark Mode Fix", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render hero title with correct light mode styling", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<HomePage />);

    const heroTitle = screen.getByText("Never Miss a Birthday Deal Again");

    // Should have text-gray-900 for light mode
    expect(heroTitle).toHaveClass("text-gray-900");
    expect(heroTitle).not.toHaveClass("text-white");
  });

  it("should render hero title with correct dark mode styling", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<HomePage />);

    const heroTitle = screen.getByText("Never Miss a Birthday Deal Again");

    // Should have text-white for dark mode
    expect(heroTitle).toHaveClass("text-white");
    expect(heroTitle).not.toHaveClass("text-gray-900");
  });

  it("should not use hardcoded color classes in hero title", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<HomePage />);

    const heroTitle = screen.getByText("Never Miss a Birthday Deal Again");

    // Should not have the problematic hardcoded classes
    expect(heroTitle).not.toHaveClass("!text-gray-900");
    expect(heroTitle).not.toHaveClass("dark:text-white");
  });

  it("should toggle hero title color when dark mode changes", () => {
    // Start with light mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    const { rerender } = render(<HomePage />);

    let heroTitle = screen.getByText("Never Miss a Birthday Deal Again");
    expect(heroTitle).toHaveClass("text-gray-900");

    // Switch to dark mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    rerender(<HomePage />);

    heroTitle = screen.getByText("Never Miss a Birthday Deal Again");
    expect(heroTitle).toHaveClass("text-white");
  });

  it("should apply consistent styling to hero description", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<HomePage />);

    const heroDescription = screen.getByText(/Track your birthday benefits/);

    // Hero description should also have proper dark mode styling
    expect(heroDescription).toHaveClass("text-gray-300");
  });

  it("should maintain proper contrast in both light and dark modes", () => {
    // Test light mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    const { rerender } = render(<HomePage />);

    const heroTitle = screen.getByText("Never Miss a Birthday Deal Again");
    expect(heroTitle).toHaveClass("text-gray-900");

    const heroDescription = screen.getByText(/Track your birthday benefits/);
    expect(heroDescription).toHaveClass("text-gray-900");

    // Test dark mode
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    rerender(<HomePage />);

    const darkHeroTitle = screen.getByText("Never Miss a Birthday Deal Again");
    expect(darkHeroTitle).toHaveClass("text-white");

    const darkHeroDescription = screen.getByText(
      /Track your birthday benefits/,
    );
    expect(darkHeroDescription).toHaveClass("text-gray-300");
  });

  it("should use dynamic isDarkMode check instead of CSS classes", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<HomePage />);

    // Verify the title exists and has proper styling
    const heroTitle = screen.getByRole("heading", { level: 1 });
    expect(heroTitle).toBeInTheDocument();
    expect(heroTitle).toHaveClass("text-white");

    // Should not have conflicting color classes
    const classNames = heroTitle.className;
    expect(classNames).not.toMatch(/!text-gray-900/);
    expect(classNames).not.toMatch(/dark:text-white/);
  });

  it("should apply dark mode to entire page background", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<HomePage />);

    // Check that main container has dark mode gradient
    const mainContainer = document.querySelector(".min-h-screen");
    expect(mainContainer).toHaveClass(
      "from-gray-900",
      "via-gray-800",
      "to-gray-900",
    );
  });

  it("should apply light mode to entire page background", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
    });

    render(<HomePage />);

    // Check that main container has light mode gradient
    const mainContainer = document.querySelector(".min-h-screen");
    expect(mainContainer).toHaveClass(
      "from-purple-50",
      "via-pink-50",
      "to-orange-50",
    );
  });

  it("should have feature titles with proper dark mode styling", () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
    });

    render(<HomePage />);

    const featureTitles = screen.getAllByText(
      /Track Benefits|Never Miss|Save Money/,
    );

    featureTitles.forEach((title) => {
      expect(title).toHaveClass("text-white");
      expect(title).not.toHaveClass("text-gray-900");
    });
  });
});
