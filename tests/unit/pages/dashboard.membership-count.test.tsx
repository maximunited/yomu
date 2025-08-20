import { render, screen, waitFor } from "__tests__/utils/test-helpers";
import DashboardPage from "@/app/dashboard/page";

// Mock fetch responses for memberships and benefits
const originalFetch = global.fetch;

describe("Dashboard membership summary count", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (url: RequestInfo) => {
      const u = String(url);
      if (u.includes("/api/user/memberships")) {
        // No active memberships
        return new Response(JSON.stringify({ memberships: [] }), {
          status: 200,
        }) as any;
      }
      if (u.includes("/api/benefits")) {
        // Provide 24 benefits across multiple brands
        const brands = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const benefits = Array.from({ length: 24 }).map((_, i) => ({
          id: `b${i}`,
          title: `t${i}`,
          description: `d${i}`,
          brandId: brands[i % brands.length],
          brand: {
            id: brands[i % brands.length],
            name: `Brand ${brands[i % brands.length]}`,
            logoUrl: "",
            website: "",
            description: "",
            category: "food",
          },
          validityType: "birthday_entire_month",
          redemptionMethod: "in-store",
          isFree: true,
        }));
        return new Response(JSON.stringify({ benefits }), {
          status: 200,
        }) as any;
      }
      if (u.includes("/api/user/profile")) {
        return new Response(JSON.stringify({ user: {} }), {
          status: 200,
        }) as any;
      }
      return new Response("{}", { status: 200 }) as any;
    }) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("falls back to available brand count when memberships are 0", async () => {
    render(<DashboardPage />);
    await waitFor(() =>
      expect(
        screen.getByText(/Active Memberships|חברים פעילים/i),
      ).toBeInTheDocument(),
    );
    // The count element is the next div with purple text; we assert it eventually reflects non-zero
    const countEl = await screen.findByText((_, node) => {
      return Boolean(
        node?.textContent && node?.className?.includes("text-purple-600"),
      );
    });
    expect(countEl.textContent).not.toBe("0");
  });
});
