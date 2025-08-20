import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("should render with default props", () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("flex", "h-10", "w-full", "rounded-md", "border");
  });

  it("should render with different types", () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);

    let input = screen.getByPlaceholderText("Email");
    expect(input).toHaveAttribute("type", "email");

    rerender(<Input type="password" placeholder="Password" />);
    input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");

    rerender(<Input type="number" placeholder="Number" />);
    input = screen.getByPlaceholderText("Number");
    expect(input).toHaveAttribute("type", "number");
  });

  it("should handle value changes", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("should call onChange handler", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    await user.type(input, "test");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="Disabled input" />);

    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );
  });

  it("should not handle input when disabled", async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(
      <Input disabled onChange={handleChange} placeholder="Disabled input" />,
    );

    const input = screen.getByPlaceholderText("Disabled input");
    await user.type(input, "test");

    expect(input).toHaveValue("");
  });

  it("should forward ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref input" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("should apply custom className", () => {
    render(<Input className="custom-class" placeholder="Custom input" />);

    const input = screen.getByPlaceholderText("Custom input");
    expect(input).toHaveClass("custom-class");
  });

  it("should spread additional props", () => {
    render(
      <Input
        data-testid="test-input"
        aria-label="Test input"
        placeholder="Test input"
      />,
    );

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("aria-label", "Test input");
  });

  it("should have correct focus styles", () => {
    render(<Input placeholder="Focus input" />);

    const input = screen.getByPlaceholderText("Focus input");
    expect(input).toHaveClass(
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-purple-500",
    );
  });

  it("should handle required attribute", () => {
    render(<Input required placeholder="Required input" />);

    const input = screen.getByPlaceholderText("Required input");
    expect(input).toBeRequired();
  });

  it("should handle name attribute", () => {
    render(<Input name="test-name" placeholder="Named input" />);

    const input = screen.getByPlaceholderText("Named input");
    expect(input).toHaveAttribute("name", "test-name");
  });

  it("should handle id attribute", () => {
    render(<Input id="test-id" placeholder="ID input" />);

    const input = screen.getByPlaceholderText("ID input");
    expect(input).toHaveAttribute("id", "test-id");
  });

  it("should handle controlled value", () => {
    render(
      <Input
        value="controlled value"
        onChange={() => {}}
        placeholder="Controlled input"
      />,
    );

    const input = screen.getByPlaceholderText("Controlled input");
    expect(input).toHaveValue("controlled value");
  });

  it("should handle placeholder text", () => {
    render(<Input placeholder="This is a placeholder" />);

    const input = screen.getByPlaceholderText("This is a placeholder");
    expect(input).toBeInTheDocument();
  });

  it("should handle maxLength attribute", () => {
    render(<Input maxLength={10} placeholder="Max length input" />);

    const input = screen.getByPlaceholderText("Max length input");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("should handle min and max attributes for number inputs", () => {
    render(
      <Input type="number" min={0} max={100} placeholder="Number input" />,
    );

    const input = screen.getByPlaceholderText("Number input");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
  });
});
