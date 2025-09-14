import { render, screen, waitFor } from '../../utils/test-helpers';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/settings/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  })),
}));

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      dateOfBirth: '1990-01-01',
    },
  }),
});

describe('SettingsPage (render)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings page without crashing', () => {
    render(<SettingsPage />);
    const settingsElements = screen.getAllByText(/הגדרות/i);
    expect(settingsElements.length).toBeGreaterThan(0);

    // Just check for some unique text that appears once
    expect(screen.getByText(/ערוך פרופיל/i)).toBeInTheDocument();
    expect(screen.getByText(/בחר את השפה המועדפת/i)).toBeInTheDocument();
  });

  it('should display form inputs for user profile', async () => {
    render(<SettingsPage />);

    // Should have form inputs - look for input elements instead of labels
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2); // name and email inputs

      // Look for date inputs specifically
      const dateInputs = screen.getAllByDisplayValue('');
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });

  it('should handle form interactions', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    // Wait for inputs to be rendered
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    // Find the name input (first textbox should be name input)
    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0]; // Should be the name input

    // First click the edit button to enable editing
    const editButton = screen.getByText(/ערוך פרופיל/i);
    await user.click(editButton);

    // Now try to type in the name field
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');

    expect(nameInput).toHaveValue('New Name');
  });

  it('should display dark mode toggle functionality', () => {
    render(<SettingsPage />);

    // Should have dark mode toggle - look for the appearance section header specifically
    const appearanceHeaders = screen.getAllByText(/מראה/i);
    expect(appearanceHeaders[0]).toBeInTheDocument();
  });

  it('should display language settings', () => {
    render(<SettingsPage />);

    // Should have language selection
    expect(screen.getByText(/בחר את השפה המועדפת/i)).toBeInTheDocument();
  });

  it('should show API key section', () => {
    render(<SettingsPage />);

    // Should have API key section - look for the Hebrew text for API key heading specifically
    const apiKeyElements = screen.getAllByText(/מפתח API/i);
    expect(apiKeyElements[0]).toBeInTheDocument(); // Should be the h2 heading
  });
});
