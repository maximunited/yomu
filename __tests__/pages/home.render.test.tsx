import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage (render)", () => {
  it("renders and shows auth links", () => {
    render(<HomePage />);
    // header brand
    expect(screen.getByText(/YomU/)).toBeInTheDocument();
    // auth links
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/auth/signin");
    expect(hrefs).toContain("/auth/signup");
  });
});
