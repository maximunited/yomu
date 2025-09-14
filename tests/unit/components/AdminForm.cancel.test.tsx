import { render, screen, fireEvent } from '@testing-library/react';
import AdminForm from '@/components/AdminForm';

describe('AdminForm cancel', () => {
  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<AdminForm type="brand" onSave={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
