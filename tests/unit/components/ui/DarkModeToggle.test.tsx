import { render, screen, fireEvent } from "@testing-library/react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

describe("DarkModeToggle", () => {
  it("renders and toggles aria-label", () => {
    // polyfill matchMedia for jsdom
    // @ts-ignore
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: () => {},
          removeListener: () => {},
        } as any;
      };
    render(
      <DarkModeProvider>
        <DarkModeToggle showText />
      </DarkModeProvider>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-label", "Switch to light mode");
  });

  it("can render with showText", () => {
    // @ts-ignore
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: () => {},
          removeListener: () => {},
        } as any;
      };
    render(
      <DarkModeProvider>
        <DarkModeToggle showText />
      </DarkModeProvider>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // Note: toggle behavior covered by first test; avoid duplicate flakiness here
});
