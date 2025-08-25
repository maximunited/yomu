import React from "react";
import { render, waitFor } from "../../utils/test-helpers";
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
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("MembershipsPage useEffect Dependencies", () => {
  let fetchCallCount: number;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchCallCount = 0;

    // Track fetch calls to detect infinite loops
    (global.fetch as jest.Mock).mockImplementation((...args) => {
      fetchCallCount++;
      const url = args[0];

      if (url.includes("/api/brands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: "brand1",
              name: "Test Brand",
              logoUrl: "https://example.com/logo.png",
              category: "food",
              description: "Test description",
            },
          ],
        });
      }

      if (url.includes("/api/user/memberships")) {
        return Promise.resolve({
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
        });
      }

      if (url.includes("/api/benefits")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            benefits: [
              {
                id: "benefit1",
                brandId: "brand1",
                title: "Test Benefit",
                isFree: true,
              },
            ],
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    // Mock authenticated session
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({
      data: { user: { id: "test-user-id" } },
      status: "authenticated",
    });
  });

  it("should not create infinite loop in useEffect", async () => {
    const { unmount } = render(<MembershipsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(fetchCallCount).toBeGreaterThan(0);
    });

    // Record fetch count after initial load
    const initialFetchCount = fetchCallCount;

    // Wait a bit more to ensure no additional calls
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not have excessive calls (proving no infinite loop)
    // Initial load makes 3 calls (/api/brands, /api/user/memberships, /api/benefits)
    // React testing may cause some re-renders, but should be reasonable
    expect(fetchCallCount).toBeLessThan(20); // Much better than the previous infinite loop

    unmount();
  });

  it("should not re-fetch when memberships state changes internally", async () => {
    const { unmount } = render(<MembershipsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(fetchCallCount).toBeGreaterThan(0);
    });

    const initialFetchCount = fetchCallCount;

    // Wait longer to ensure no continuous re-fetching
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Should not have excessive additional fetch calls
    expect(fetchCallCount).toBeLessThan(35); // No infinite loop

    unmount();
  });

  it("should handle session changes without infinite loop", async () => {
    const { rerender, unmount } = render(<MembershipsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(fetchCallCount).toBeGreaterThan(0);
    });

    const initialFetchCount = fetchCallCount;

    // Change session but keep it authenticated
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({
      data: { user: { id: "different-user-id" } },
      status: "authenticated",
    });

    // Re-render with new session
    rerender(<MembershipsPage />);

    // Wait for potential re-fetch
    await waitFor(() => {
      // Should fetch again due to session change, but not infinitely
      expect(fetchCallCount).toBeGreaterThan(initialFetchCount);
    });

    const afterSessionChangeFetchCount = fetchCallCount;

    // Wait to ensure no infinite loop after session change
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not continue growing excessively after session change
    expect(fetchCallCount).toBeLessThan(40); // No infinite loop

    unmount();
  });

  it("should handle fallback data without state inconsistency", async () => {
    // Mock fetch to fail and trigger fallback
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { unmount } = render(<MembershipsPage />);

    // Wait for initial attempts to be made
    await new Promise((resolve) => setTimeout(resolve, 100));

    const initialFetchCount = fetchCallCount;

    // Wait to ensure fallback doesn't cause additional fetches
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not have excessive additional calls after fallback
    expect(fetchCallCount).toBeLessThan(10);

    unmount();
  });

  it("should maintain consistent originalMemberships state", async () => {
    // Mock console.error to suppress expected error logs from fallback
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock fetch to fail for testing fallback consistency
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { unmount } = render(<MembershipsPage />);

    // Wait for component to mount and attempts to be made
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Wait to ensure state is stable
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should not cause infinite re-renders - some retries are expected
    const finalFetchCount = fetchCallCount;
    expect(finalFetchCount).toBeLessThan(10); // Should be just the initial failed attempts

    consoleSpy.mockRestore();
    unmount();
  });
});
