import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button variants accessibility", () => {
  it("has aria-disabled when disabled", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
  });
});
