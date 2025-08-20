import React from "react";
import { render, screen } from "@testing-library/react";

describe("Simple Test", () => {
  test("renders a simple component", () => {
    render(<div>Hello World</div>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
