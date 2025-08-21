import { render, screen } from "../../utils/test-helpers";
import TermsPage from "@/app/terms/page";

describe("TermsPage (render)", () => {
  it("renders terms sections", () => {
    render(<TermsPage />);
    const termsElements = screen.getAllByText(/תנאים/i);
    expect(termsElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/אחריות/i)).toBeInTheDocument();
  });
});
