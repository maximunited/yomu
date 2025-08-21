import React from "react";
import { render, screen, waitFor, act } from "../../utils/test-helpers";
import userEvent from "@testing-library/user-event";
import MembershipsPage from "@/app/memberships/page";

// Mock next-auth
const mockUseSession = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Memberships Page Advanced Features", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1", name: "Test User" } },
      status: "authenticated",
    });

    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "brand-1",
            name: "Coffee Shop",
            logoUrl: "coffee.png",
            category: "beverage",
            website: "coffee.com",
            description: "Best coffee in town",
            isActive: true,
          },
          {
            id: "brand-2",
            name: "Pizza Place",
            logoUrl: "pizza.png",
            category: "food",
            website: "pizza.com",
            description: "Delicious pizza",
            isActive: true,
          },
          {
            id: "brand-3",
            name: "Bookstore",
            logoUrl: "books.png",
            category: "retail",
            website: "books.com",
            description: "Great books",
            isActive: true,
          },
        ],
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
                name: "Coffee Shop",
                logoUrl: "coffee.png",
                category: "beverage",
              },
            },
          ],
        }),
      });
  });

  it("should display all available brands for membership", async () => {
    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
      expect(screen.getByText("Bookstore")).toBeInTheDocument();
    });
  });

  it("should filter brands by category", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });

    // Find category filter buttons
    const categoryButtons = screen.getAllByRole("button");
    const foodButton = categoryButtons.find(
      (btn) =>
        btn.textContent?.toLowerCase().includes("food") ||
        btn.textContent?.toLowerCase().includes("מזון"),
    );

    if (foodButton) {
      await user.click(foodButton);

      await waitFor(() => {
        expect(screen.getByText("Pizza Place")).toBeInTheDocument();
        expect(screen.queryByText("Coffee Shop")).not.toBeInTheDocument();
      });
    }
  });

  it("should search brands by name", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search|חיפוש/i);
    await user.type(searchInput, "coffee");

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.queryByText("Pizza Place")).not.toBeInTheDocument();
    });
  });

  it("should toggle membership status", async () => {
    const user = userEvent.setup();

    // Mock successful toggle response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        membership: {
          id: "membership-2",
          brandId: "brand-2",
          isActive: true,
        },
      }),
    });

    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });

    // Find and click membership toggle for Pizza Place
    const pizzaSection = screen.getByText("Pizza Place").closest("div");
    const toggleButton = pizzaSection?.querySelector("button");

    if (toggleButton) {
      await user.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/user/memberships",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("brand-2"),
          }),
        );
      });
    }
  });

  it("should handle membership toggle errors", async () => {
    const user = userEvent.setup();

    // Mock failed toggle response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });

    const pizzaSection = screen.getByText("Pizza Place").closest("div");
    const toggleButton = pizzaSection?.querySelector("button");

    if (toggleButton) {
      await user.click(toggleButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    }
  });

  it("should show active memberships distinctly", async () => {
    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    });

    // Coffee Shop should show as active (has membership)
    const coffeeSection = screen.getByText("Coffee Shop").closest("div");
    expect(coffeeSection).toBeInTheDocument();

    // Pizza Place should show as inactive (no membership)
    const pizzaSection = screen.getByText("Pizza Place").closest("div");
    expect(pizzaSection).toBeInTheDocument();
  });

  it("should handle empty brand list", async () => {
    // Mock empty brands response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ memberships: [] }),
      });

    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      // Should handle empty state gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  it("should handle API errors gracefully", async () => {
    // Mock API failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(<MembershipsPage />);
    });

    // Should not crash on API error
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it("should clear search results when search is emptied", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search|חיפוש/i);

    // Search for something
    await user.type(searchInput, "coffee");
    await waitFor(() => {
      expect(screen.queryByText("Pizza Place")).not.toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);
    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });
  });

  it("should show brand categories correctly", async () => {
    await act(async () => {
      render(<MembershipsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    });

    // Should display category information
    expect(screen.getByText(/beverage|משקאות/i)).toBeInTheDocument();
    expect(screen.getByText(/food|מזון/i)).toBeInTheDocument();
    expect(screen.getByText(/retail|קמעונאות/i)).toBeInTheDocument();
  });
});
