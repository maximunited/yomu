import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';

describe('SettingsPage toggles', () => {
  it('toggles dark mode and edits api key', () => {
    render(<SettingsPage />);

    // Dark mode toggle
    const darkToggle = screen.getByRole('button', { name: /dark|light|מצב/i });
    fireEvent.click(darkToggle);

    // API key edit flow
    const editBtn = screen.getByRole('button', { name: /ערוך מפתח API/i });
    fireEvent.click(editBtn);

    // After clicking edit, look for save button
    const saveBtn = screen.getByRole('button', { name: /שמור|save/i });
    fireEvent.click(saveBtn);
  });
});
