import { render, screen } from "@testing-library/react";

describe("Simple Test", () => {
  test("should work", () => {
    render(<div>Hello World</div>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
