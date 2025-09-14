import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      'bg-purple-600',
      'text-white',
      'hover:bg-purple-700'
    );
    expect(button).toHaveClass('h-10', 'px-4', 'py-2');
  });

  it('should render with different variants', () => {
    const { rerender } = render(
      <Button variant="outline">Outline Button</Button>
    );

    let button = screen.getByRole('button', { name: 'Outline Button' });
    expect(button).toHaveClass(
      'border-2',
      'border-gray-400',
      'bg-white',
      'text-gray-700'
    );

    rerender(<Button variant="ghost">Ghost Button</Button>);
    button = screen.getByRole('button', { name: 'Ghost Button' });
    expect(button).toHaveClass('text-gray-700', 'hover:bg-gray-100');

    rerender(<Button variant="destructive">Destructive Button</Button>);
    button = screen.getByRole('button', { name: 'Destructive Button' });
    expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small Button</Button>);

    let button = screen.getByRole('button', { name: 'Small Button' });
    expect(button).toHaveClass('h-9', 'px-3', 'text-sm');

    rerender(<Button size="lg">Large Button</Button>);
    button = screen.getByRole('button', { name: 'Large Button' });
    expect(button).toHaveClass('h-11', 'px-8');
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      'disabled:opacity-50',
      'disabled:pointer-events-none'
    );
  });

  it('should not handle click events when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('custom-class');
  });

  it('should spread additional props', () => {
    render(
      <Button data-testid="test-button" aria-label="Test button">
        Test
      </Button>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('should render with complex children', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('IconText');
  });

  it('should have correct focus styles', () => {
    render(<Button>Focus Button</Button>);

    const button = screen.getByRole('button', { name: 'Focus Button' });
    expect(button).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-purple-500'
    );
  });
});
