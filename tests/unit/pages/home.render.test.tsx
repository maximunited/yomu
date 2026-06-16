import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import { DarkModeProvider } from '@/contexts/DarkModeContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: null,
    isLoaded: true,
    isSignedIn: false,
  })),
  useAuth: jest.fn(() => ({
    userId: null,
    isLoaded: true,
    isSignedIn: false,
  })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>);
};

describe('HomePage (render)', () => {
  it('renders and shows auth links', () => {
    renderWithProviders(<HomePage />);
    // header brand (get all occurrences and verify at least one exists)
    expect(screen.getAllByText(/YomU/)).toHaveLength(3); // header, logo, footer
    // auth links
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/sign-in');
    expect(hrefs).toContain('/sign-up');
  });

  it('renders main content sections', () => {
    renderWithProviders(<HomePage />);

    // Should have main headings
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Should have feature sections
    const features = screen.getAllByText(/יום הולדת|benefits|חברים/i);
    expect(features.length).toBeGreaterThan(0);
  });

  it('has proper navigation structure', () => {
    renderWithProviders(<HomePage />);

    // Should have navigation elements
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);

    // Should have buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays call-to-action elements', () => {
    renderWithProviders(<HomePage />);

    // Should have sign up/sign in CTAs
    expect(screen.getByText(/התחבר/i)).toBeInTheDocument();
    expect(screen.getByText(/הרשמה/i)).toBeInTheDocument();
  });

  it('should be accessible to screen readers', () => {
    renderWithProviders(<HomePage />);

    // Should have proper ARIA labels and roles
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });
});
