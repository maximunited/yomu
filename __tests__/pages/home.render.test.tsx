import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: jest.fn(),
}));

describe("HomePage (render)", () => {
  it("renders and shows auth links", () => {
    render(<HomePage />);
    // header brand
    expect(screen.getByText(/YomU/)).toBeInTheDocument();
    // auth links
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/auth/signin");
    expect(hrefs).toContain("/auth/signup");
  });

  it("renders main content sections", () => {
    render(<HomePage />);

    // Should have main headings
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    // Should have feature sections
    const features = screen.getAllByText(/יום הולדת|benefits|חברים/i);
    expect(features.length).toBeGreaterThan(0);
  });

  it("has proper navigation structure", () => {
    render(<HomePage />);

    // Should have navigation elements
    const navLinks = screen.getAllByRole("link");
    expect(navLinks.length).toBeGreaterThan(0);

    // Should have buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("displays call-to-action elements", () => {
    render(<HomePage />);

    // Should have sign up/sign in CTAs
    expect(screen.getByText(/התחבר/i)).toBeInTheDocument();
    expect(screen.getByText(/הרשמה/i)).toBeInTheDocument();
  });

  it("should be accessible to screen readers", () => {
    render(<HomePage />);

    // Should have proper ARIA labels and roles
    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
  });
});
