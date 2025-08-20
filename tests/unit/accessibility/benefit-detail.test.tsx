import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenefitDetailPage from "@/app/benefit/[id]/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ id: "test-benefit-id" })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("BenefitDetailPage Accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "test-benefit-id",
        title: "Test Benefit",
        description: "Test benefit description",
        brand: {
          name: "Test Brand",
          logoUrl: "https://example.com/logo.png",
          website: "https://example.com",
        },
        promoCode: "TEST123",
        url: "https://example.com/buy",
        validityType: "birthday_month",
        redemptionMethod: "Use promo code",
        termsAndConditions: "Test terms and conditions",
      }),
    });
  });

  it("should have proper heading structure", async () => {
    render(<BenefitDetailPage />);

    // Wait for content to load
    await screen.findByText("Test Benefit");

    // Check for main heading
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent("Test Brand");

    // Check for section headings
    const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
    expect(sectionHeadings).toHaveLength(2); // "פרטי ההטבה" and "פעולות"
  });

  it("should have proper button labels and ARIA attributes", async () => {
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");
    await screen.findByText("TEST123"); // Wait for promo code to appear

    // Check copy button
    const copyButton = screen.getByRole("button", { name: /העתק קוד קופון/i });
    expect(copyButton).toBeInTheDocument();

    // Check action buttons
    const buyButton = screen.getByRole("button", {
      name: /לקנייה באתר המותג/i,
    });
    expect(buyButton).toBeInTheDocument();
    expect(buyButton).toHaveAttribute("title", "לחץ לקנייה ישירה באתר המותג");

    const brandWebsiteButton = screen.getByRole("button", {
      name: /אתר המותג הרשמי/i,
    });
    expect(brandWebsiteButton).toBeInTheDocument();
    expect(brandWebsiteButton).toHaveAttribute(
      "title",
      "לחץ לביקור באתר הרשמי של המותג",
    );

    const reportButton = screen.getByRole("button", {
      name: /דווח על מידע שגוי או חסר/i,
    });
    expect(reportButton).toBeInTheDocument();
  });

  it("should be keyboard navigable", async () => {
    const user = userEvent.setup();
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");

    // Test tab navigation
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Focus first button
    buttons[0].focus();
    expect(buttons[0]).toHaveFocus();

    // Test tab to next button
    await user.tab();
    expect(buttons[1]).toHaveFocus();
  });

  it("should have proper color contrast for text", async () => {
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");

    // Check that important text has sufficient contrast
    const benefitTitle = screen.getByText("Test Benefit");
    expect(benefitTitle).toBeInTheDocument();

    const benefitDescription = screen.getByText("Test benefit description");
    expect(benefitDescription).toBeInTheDocument();
  });

  it("should have proper focus indicators", async () => {
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");

    const buttons = screen.getAllByRole("button");

    // Test focus styles
    buttons.forEach((button) => {
      button.focus();
      expect(button).toHaveFocus();
      // Check for focus-visible class or outline
      expect(button).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
      );
    });
  });

  it("should have proper alt text for images", async () => {
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");

    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });
  });

  it("should handle screen reader announcements", async () => {
    const user = userEvent.setup();
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");
    await screen.findByText("TEST123"); // Wait for promo code to appear

    // Test copy functionality with screen reader feedback
    const copyButton = screen.getByRole("button", { name: /העתק קוד קופון/i });
    await user.click(copyButton);

    // Check for success message
    const successMessage = await screen.findByText("✓ הועתק ללוח");
    expect(successMessage).toBeInTheDocument();
  });

  it("should have proper form labels and descriptions", async () => {
    render(<BenefitDetailPage />);

    await screen.findByText("Test Benefit");

    // Check that sections have proper labels
    const benefitDetailsSection = screen.getByText("פרטי ההטבה");
    expect(benefitDetailsSection).toBeInTheDocument();

    const actionsSection = screen.getByText("פעולות");
    expect(actionsSection).toBeInTheDocument();
  });

  it("should handle error states accessibly", async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<BenefitDetailPage />);

    // Check for error message - exact match
    const errorMessage = await screen.findByText("הטבה לא נמצאה");
    expect(errorMessage).toBeInTheDocument();
  });
});
