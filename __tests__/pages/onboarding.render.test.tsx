import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

describe("OnboardingPage (render)", () => {
  it("renders and toggles a brand card", () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/onboarding/i)).toBeInTheDocument();
    const anyCard = screen.getAllByRole("img")[0];
    fireEvent.click(anyCard);
  });
});
