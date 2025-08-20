import { render, screen } from "@testing-library/react";
import AdminForm from "@/components/AdminForm";

describe("AdminForm with empty optional fields", () => {
  it("renders benefit form fields (smoke)", () => {
    render(<AdminForm type="benefit" onSave={jest.fn()} onCancel={() => {}} />);
    expect(screen.getByLabelText(/Title|כותרת|title/i)).toBeInTheDocument();
  });
});
