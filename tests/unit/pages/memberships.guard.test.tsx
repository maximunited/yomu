import { render } from "@testing-library/react";
import MembershipsPage from "@/app/memberships/page";

describe("MembershipsPage auth guard", () => {
  it('renders null when unauthenticated (status="unauthenticated")', () => {
    const { container } = render(<MembershipsPage />);
    expect(container).toBeEmptyDOMElement();
  });
});
