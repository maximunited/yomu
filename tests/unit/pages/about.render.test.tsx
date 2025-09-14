import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <DarkModeProvider>
      <LanguageProvider>{component}</LanguageProvider>
    </DarkModeProvider>
  );
};

describe('AboutPage (render)', () => {
  it('renders headings and sections', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/about|על/i)).toBeInTheDocument();
    expect(screen.getByText(/mission|חזון|vision/i)).toBeInTheDocument();
    expect(screen.getAllByText(/team|צוות/i).length).toBeGreaterThan(0);
  });

  it('should display company information', () => {
    renderWithProviders(<AboutPage />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should be accessible', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });
});
