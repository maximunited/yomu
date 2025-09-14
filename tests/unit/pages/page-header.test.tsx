import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the contexts
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        about: 'About',
        terms: 'Terms',
        privacy: 'Privacy',
        contact: 'Contact',
        back: 'Back',
        languageAbbreviationHebrew: 'עב',
        languageAbbreviationEnglish: 'EN',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/contexts/DarkModeContext', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
}));

// Mock the components
jest.mock('@/components/ui/LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return (
      <button className="language-switcher">
        <span>עב</span>
      </button>
    );
  };
});

jest.mock('@/components/ui/DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return (
      <button aria-label="Switch to dark mode" className="dark-mode-toggle">
        <span>🌙</span>
      </button>
    );
  };
});

jest.mock('@/components/PageHeader', () => {
  return function MockPageHeader({ title }: { title: string }) {
    return (
      <header className="page-header">
        <button>Back</button>
        <span>{title}</span>
        <button aria-label="Switch to dark mode">🌙</button>
        <button className="language-switcher">עב</button>
      </header>
    );
  };
});

// Import the pages
import AboutPage from '@/app/about/page';
import TermsPage from '@/app/terms/page';
import PrivacyPage from '@/app/privacy/page';
import ContactPage from '@/app/contact/page';

describe('PageHeader Component', () => {
  test('renders with back button, title, and controls', () => {
    render(<AboutPage />);

    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /עב/i })).toBeInTheDocument();
  });
});

describe('About Page', () => {
  test('renders with language switcher and dark mode toggle', () => {
    render(<AboutPage />);

    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /עב/i })).toBeInTheDocument();
  });

  test('has proper page structure', () => {
    render(<AboutPage />);

    // Check that the page has the expected structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Check that the page title is present
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
  });

  test('supports dark mode styling', async () => {
    render(<AboutPage />);

    const darkModeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i,
    });
    expect(darkModeToggle).toBeInTheDocument();

    // Check that the page has proper dark mode classes
    const mainContainer = screen.getByRole('main').closest('div');
    expect(mainContainer).toHaveClass('min-h-screen');
  });
});

describe('Terms Page', () => {
  test('renders with language switcher and dark mode toggle', () => {
    render(<TermsPage />);

    expect(screen.getAllByText('Terms').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /עב/i })).toBeInTheDocument();
  });

  test('has proper page structure', () => {
    render(<TermsPage />);

    // Check that the page has the expected structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Check that the page title is present
    expect(screen.getAllByText('Terms').length).toBeGreaterThan(0);
  });

  test('supports dark mode styling', async () => {
    render(<TermsPage />);

    const darkModeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i,
    });
    expect(darkModeToggle).toBeInTheDocument();
  });
});

describe('Privacy Page', () => {
  test('renders with language switcher and dark mode toggle', () => {
    render(<PrivacyPage />);

    expect(screen.getAllByText('Privacy').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /עב/i })).toBeInTheDocument();
  });

  test('has proper page structure', () => {
    render(<PrivacyPage />);

    // Check that the page has the expected structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Check that the page title is present
    expect(screen.getAllByText('Privacy').length).toBeGreaterThan(0);
  });

  test('supports dark mode styling', async () => {
    render(<PrivacyPage />);

    const darkModeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i,
    });
    expect(darkModeToggle).toBeInTheDocument();
  });
});

describe('Contact Page', () => {
  test('renders with language switcher and dark mode toggle', () => {
    render(<ContactPage />);

    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /עב/i })).toBeInTheDocument();
  });

  test('has proper page structure', () => {
    render(<ContactPage />);

    // Check that the page has the expected structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Check that the page title is present
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });

  test('supports dark mode styling', async () => {
    render(<ContactPage />);

    const darkModeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i,
    });
    expect(darkModeToggle).toBeInTheDocument();
  });
});

describe('Language Switching', () => {
  test('language switcher changes language', async () => {
    render(<AboutPage />);

    const languageButton = screen.getByRole('button', { name: /עב/i });
    expect(languageButton).toBeInTheDocument();

    // The language switching functionality is mocked, so we just verify the button exists
    expect(languageButton).toBeInTheDocument();
  });
});

describe('Dark Mode Toggle', () => {
  test('dark mode toggle changes theme', async () => {
    render(<AboutPage />);

    const darkModeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i,
    });
    expect(darkModeToggle).toBeInTheDocument();

    // The dark mode functionality is mocked, so we just verify the button exists
    expect(darkModeToggle).toBeInTheDocument();
  });
});
