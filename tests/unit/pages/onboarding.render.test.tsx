import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingPage from "@/app/onboarding/page";

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
    data: {
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      },
    },
    status: "authenticated",
  })),
}));

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => [
    {
      id: "brand1",
      name: "Test Brand 1",
      logoUrl: "https://example.com/logo1.png",
      category: "food",
      isActive: true,
    },
  ],
});

describe("OnboardingPage (render)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders and toggles a brand card", () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/onboarding/i)).toBeInTheDocument();
    const anyCard = screen.getAllByRole("img")[0];
    fireEvent.click(anyCard);
  });

  it("should display loading state initially", () => {
    render(<OnboardingPage />);

    expect(screen.getByText(/loading|טוען/i)).toBeInTheDocument();
  });

  it("should display brands after loading", async () => {
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand 1")).toBeInTheDocument();
    });
  });

  it("should allow brand selection", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand 1")).toBeInTheDocument();
    });

    // Click on brand card to select it
    const brandCard = screen.getByText("Test Brand 1").closest("div");
    await user.click(brandCard!);

    // Should add selection visual indicator
    expect(brandCard).toHaveClass("border-purple-500");
  });

  it("should handle search functionality", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand 1")).toBeInTheDocument();
    });

    // Search for brands
    const searchInput = screen.getByPlaceholderText(/search|חיפוש/i);
    await user.type(searchInput, "Test");

    expect(searchInput).toHaveValue("Test");
  });

  it("should display category filter", async () => {
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand 1")).toBeInTheDocument();
    });

    // Should have category filter dropdown
    const categoryFilter = screen.getByDisplayValue(/all|הכל/i);
    expect(categoryFilter).toBeInTheDocument();
  });
});
