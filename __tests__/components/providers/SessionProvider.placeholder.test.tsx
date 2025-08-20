import { SessionProvider } from "@/components/providers/SessionProvider";
import { render } from "@testing-library/react";

describe("SessionProvider placeholder", () => {
  it("renders children", () => {
    const { container } = render(
      <SessionProvider>
        <div>ok</div>
      </SessionProvider>,
    );
    expect(container.textContent).toContain("ok");
  });
});
