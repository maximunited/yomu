import React from "react";
import { screen } from "@testing-library/react";
import { render } from "../utils/test-helpers";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";
import DashboardPage from "@/app/dashboard/page";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
      },
    },
    status: "authenticated",
  })),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Application Accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("HomePage Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<HomePage />);

      // Check for main heading
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent("אל תפספסו אף הטבה ליום הולדת");

      // Check for section headings
      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it("should have proper navigation landmarks", () => {
      render(<HomePage />);

      // Check for header landmark
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();

      // Check for main landmark
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();

      // Check for footer landmark
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });

    it("should have proper button labels", () => {
      render(<HomePage />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
        expect(
          button.getAttribute("aria-label") || button.textContent,
        ).not.toBe("");
      });
    });

    it("should have proper link descriptions", () => {
      render(<HomePage />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
        expect(link.getAttribute("aria-label") || link.textContent).not.toBe(
          "",
        );
      });
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Test tab navigation through interactive elements
      const interactiveElements = screen.getAllByRole("button", "link");
      expect(interactiveElements.length).toBeGreaterThan(0);

      // Focus first element
      interactiveElements[0].focus();
      expect(interactiveElements[0]).toHaveFocus();

      // Test tab to next element
      await user.tab();
      expect(interactiveElements[1]).toHaveFocus();
    });

    it("should have proper color contrast indicators", () => {
      render(<HomePage />);

      // Check that important text has proper contrast classes
      const importantText = screen.getByText("אל תפספסו אף הטבה ליום הולדת");
      expect(importantText).toBeInTheDocument();
      expect(importantText).toHaveClass("text-gray-900", "dark:text-white");
    });

    it("should have proper focus indicators", () => {
      render(<HomePage />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        button.focus();
        expect(button).toHaveFocus();
        // Check for focus-visible classes
        expect(button).toHaveClass(
          "focus-visible:outline-none",
          "focus-visible:ring-2",
        );
      });
    });
  });

  describe("DashboardPage Accessibility", () => {
    beforeEach(() => {
      // Mock successful API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: {
              id: "user-1",
              name: "Test User",
              email: "test@example.com",
              dateOfBirth: "1990-07-02",
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            memberships: [
              {
                id: "membership-1",
                brandId: "brand-1",
                isActive: true,
                brand: {
                  id: "brand-1",
                  name: "Test Brand",
                  logoUrl: "https://example.com/logo.png",
                  website: "https://example.com",
                  description: "Test brand description",
                  category: "food",
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            benefits: [
              {
                id: "benefit-1",
                title: "Test Benefit",
                description: "Test benefit description",
                brand: {
                  name: "Test Brand",
                  logoUrl: "https://example.com/logo.png",
                  category: "food",
                },
                promoCode: "TEST123",
                url: "https://example.com",
                validityType: "birthday_month",
                validityDuration: 1,
                redemptionMethod: "code",
                termsAndConditions: "Test terms",
                isFree: true,
              },
            ],
          }),
        });
    });

    it("should have proper heading structure", async () => {
      render(<DashboardPage />);

      await screen.findByText("Test User");

      // Check for main heading
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();

      // Check for section headings
      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it("should have proper form labels", async () => {
      render(<DashboardPage />);

      await screen.findByText("Test User");

      // Check search input has proper label
      const searchInput = screen.getByPlaceholderText("חפש הטבות...");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("aria-label");

      // Check filter selects have proper labels
      const categorySelect = screen.getByRole("combobox", { name: /קטגוריה/i });
      expect(categorySelect).toBeInTheDocument();
    });

    it("should have proper button states", async () => {
      render(<DashboardPage />);

      await screen.findByText("Test User");

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        // Check disabled state is properly indicated
        if (button.hasAttribute("disabled")) {
          expect(button).toHaveAttribute("aria-disabled", "true");
        }

        // Check loading state is properly indicated
        if (button.textContent?.includes("טוען")) {
          expect(button).toHaveAttribute("aria-busy", "true");
        }
      });
    });

    it("should have proper list structure", async () => {
      render(<DashboardPage />);

      await screen.findByText("Test User");

      // Check that benefit cards are properly structured
      const benefitCards = screen.getAllByRole("article");
      expect(benefitCards.length).toBeGreaterThan(0);

      benefitCards.forEach((card) => {
        expect(card).toHaveAccessibleName();
      });
    });

    it("should have proper status announcements", async () => {
      render(<DashboardPage />);

      await screen.findByText("Test User");

      // Check for loading states
      const loadingElements = screen.getAllByText(/טוען/i);
      expect(loadingElements.length).toBeGreaterThan(0);

      // Check for success messages
      const successMessages = screen.queryAllByText(/נשמר בהצלחה/i);
      if (successMessages.length > 0) {
        expect(successMessages[0]).toHaveAttribute("role", "status");
      }
    });

    it("should have proper error handling", async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<DashboardPage />);

      // Check for error message
      const alerts = await screen.findAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });

    it("should have proper image alt text", async () => {
      render(<DashboardPage />);

      await screen.findByText("Test User");

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });

    it("should have proper skip links", () => {
      render(<DashboardPage />);

      // Check for skip to main content link
      const skipLink = screen.queryByRole("link", {
        name: /skip to main content/i,
      });
      if (skipLink) {
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute("href", "#main-content");
      }
    });
  });

  describe("General Accessibility Standards", () => {
    it("should have proper language attributes", () => {
      render(<HomePage />);

      // Check for proper lang attribute
      const html = document.documentElement;
      expect(html).toHaveAttribute("lang", "he");
      expect(html).toHaveAttribute("dir", "rtl");
    });

    it("should have proper viewport meta tag", () => {
      render(<HomePage />);

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toBeInTheDocument();
      expect(viewportMeta).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=1",
      );
    });

    it("should have proper title and description", () => {
      render(<HomePage />);

      // Check for proper title
      expect(document.title).toBe("YomU - יום-You | Birthday Benefits");

      // Check for proper meta description
      const descriptionMeta = document.querySelector(
        'meta[name="description"]',
      );
      expect(descriptionMeta).toBeInTheDocument();
    });

    it("should have proper ARIA landmarks", () => {
      render(<HomePage />);

      // Check for main landmark
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();

      // Check for navigation landmarks
      const nav = screen.queryByRole("navigation");
      if (nav) {
        expect(nav).toBeInTheDocument();
      }
    });

    it("should have proper focus management", () => {
      render(<HomePage />);

      const interactiveElements = screen.getAllByRole("button", "link");

      interactiveElements.forEach((element) => {
        element.focus();
        expect(element).toHaveFocus();

        // Check for visible focus indicator
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle.outline).not.toBe("none");
      });
    });
  });
});
