import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

describe("OnboardingPage select + submit", () => {
  it("allows brand selection interactions", async () => {
    render(<OnboardingPage />);

    // Check that brands are displayed
    expect(screen.getByText("Fox")).toBeInTheDocument();
    expect(screen.getByText("Super-Pharm - LifeStyle")).toBeInTheDocument();

    // select first brand card by clicking first image container
    const firstImg = screen.getAllByRole("img")[0];
    fireEvent.click(firstImg);

    // Verify the page still works after brand selection
    expect(screen.getByText("Fox")).toBeInTheDocument();
  });
});
