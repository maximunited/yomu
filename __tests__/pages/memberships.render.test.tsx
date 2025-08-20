import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MembershipsPage from "@/app/memberships/page";

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
    data: { user: { id: "1", email: "test@example.com" } },
    status: "authenticated",
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe("MembershipsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "brand1",
            name: "Test Brand",
            logoUrl: "https://example.com/logo.png",
            category: "food",
            isActive: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memberships: [
            {
              brandId: "brand1",
              isActive: true,
              brand: { name: "Test Brand" },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          benefits: [
            {
              id: "benefit1",
              brandId: "brand1",
              title: "Test Benefit",
            },
          ],
        }),
      });
  });

  it("should render page title and description", async () => {
    render(<MembershipsPage />);

    await waitFor(() => {
      expect(screen.getByText(/חברויות/i)).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    render(<MembershipsPage />);

    expect(screen.getByText(/טוען/i)).toBeInTheDocument();
  });

  it("should display brands after loading", async () => {
    render(<MembershipsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });
  });

  it("should handle membership toggle", async () => {
    const user = userEvent.setup();
    render(<MembershipsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });

    // Find and click toggle button
    const toggleButton = screen.getByRole("button", { name: /toggle/i });
    await user.click(toggleButton);

    // Should attempt to update membership
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/user/memberships",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("should filter brands by category", async () => {
    const user = userEvent.setup();
    render(<MembershipsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });

    // Test category filtering
    const categoryFilter = screen.getByDisplayValue(/all|הכל/i);
    await user.selectOptions(categoryFilter, "food");

    // Should still show the food category brand
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
  });

  it("should search brands by name", async () => {
    const user = userEvent.setup();
    render(<MembershipsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
    });

    // Test search functionality
    const searchInput = screen.getByPlaceholderText(/חיפוש|search/i);
    await user.type(searchInput, "Test");

    // Should still show matching brand
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
  });

  it("should redirect unauthenticated users", () => {
    // Mock unauthenticated session
    const useSession = require("next-auth/react").useSession;
    useSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<MembershipsPage />);

    // Should show authentication required message or redirect
    expect(screen.getByText(/authentication|התחבר/i)).toBeInTheDocument();
  });
});
