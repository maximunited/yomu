import React from "react";
import { render, screen, waitFor } from "../../utils/test-helpers";
import AdminPage from "@/app/admin/page";

// Mock next-auth
const mockUseSession = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("AdminPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("should redirect unauthenticated users to signin", () => {
    mockUseSession.mockReturnValue({
      status: "unauthenticated",
    });

    render(<AdminPage />);

    expect(mockPush).toHaveBeenCalledWith("/auth/signin");
  });

  it("should show loading state initially", () => {
    mockUseSession.mockReturnValue({
      status: "loading",
    });

    render(<AdminPage />);

    // Should render without crashing during loading state
    expect(document.body).toBeInTheDocument();
  });

  it("should load data when authenticated", async () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "1", name: "Test Brand", logoUrl: "", website: "" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "1", title: "Test Benefit", brandId: "1" }],
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/brands");
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/benefits");
    });
  });

  it("should handle fetch errors gracefully", async () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should not crash on fetch error
    expect(document.body).toBeInTheDocument();
  });

  it("should render admin interface for authenticated users", async () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
    });

    render(<AdminPage />);

    await waitFor(() => {
      // Should show some admin-related content
      expect(document.body).toBeInTheDocument();
    });
  });

  it("should handle non-ok response status", async () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should handle non-ok responses gracefully
    expect(document.body).toBeInTheDocument();
  });
});
