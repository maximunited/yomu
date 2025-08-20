import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DemoPage from "@/app/demo/page";

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    benefits: [
      {
        id: "benefit1",
        title: "Demo Benefit",
        description: "Test benefit description",
        brandId: "brand1",
        validityType: "birthday_exact_date",
        brand: {
          name: "Demo Brand",
          logoUrl: "https://example.com/logo.png",
        },
      },
    ],
  }),
});

describe("DemoPage (render)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders demo header and active section", () => {
    render(<DemoPage />);
    expect(screen.getByText(/YomU/)).toBeInTheDocument();
    expect(screen.getByText(/Active|זמין עכשיו|active/i)).toBeInTheDocument();
  });

  it("should display demo benefits after loading", async () => {
    render(<DemoPage />);

    await waitFor(() => {
      expect(screen.getByText("Demo Benefit")).toBeInTheDocument();
    });
  });

  it("should display benefit brand information", async () => {
    render(<DemoPage />);

    await waitFor(() => {
      expect(screen.getByText("Demo Brand")).toBeInTheDocument();
    });
  });

  it("should handle filtering and search", async () => {
    const user = userEvent.setup();
    render(<DemoPage />);

    await waitFor(() => {
      expect(screen.getByText("Demo Benefit")).toBeInTheDocument();
    });

    // Should have filter controls
    const searchInput = screen.getByPlaceholderText(/search|חיפוש/i);
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "Demo");
    expect(searchInput).toHaveValue("Demo");
  });

  it("should display benefit validity information", async () => {
    render(<DemoPage />);

    await waitFor(() => {
      expect(screen.getByText(/birthday|יום הולדת/i)).toBeInTheDocument();
    });
  });

  it("should show demo mode indicator", () => {
    render(<DemoPage />);

    // Should indicate this is demo mode
    expect(screen.getByText(/demo|דמו|preview/i)).toBeInTheDocument();
  });
});
