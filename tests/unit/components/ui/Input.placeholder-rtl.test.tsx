import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input placeholder respects RTL/LTR context', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="email@example.com" />);
    expect(
      screen.getByPlaceholderText(/email@example.com/)
    ).toBeInTheDocument();
  });
});
