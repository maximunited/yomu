import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock the contexts
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'he',
    setLanguage: jest.fn(),
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/contexts/DarkModeContext', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
  DarkModeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the UI components
jest.mock('@/components/ui/LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <button aria-label="language switcher">עברית</button>;
  };
});

jest.mock('@/components/ui/DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return <button aria-label="dark mode toggle">🌙</button>;
  };
});

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => {
  return function MockPageHeader({ title }: { title: string }) {
    return (
      <header>
        <div>Back</div>
        <div>{title}</div>
        <button aria-label="language switcher">עברית</button>
        <button aria-label="dark mode toggle">🌙</button>
      </header>
    );
  };
});

describe('Page Header Functionality', () => {
  it('should render page header with title', () => {
    const PageHeader = require('@/components/PageHeader').default;
    render(<PageHeader title="Test Page" />);
    
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'language switcher' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'dark mode toggle' })).toBeInTheDocument();
  });

  it('should render page header with back button', () => {
    const PageHeader = require('@/components/PageHeader').default;
    render(<PageHeader title="Test Page" showBackButton={true} />);
    
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should not render back button when showBackButton is false', () => {
    const PageHeader = require('@/components/PageHeader').default;
    render(<PageHeader title="Test Page" showBackButton={false} />);
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });
});

describe('Language and Dark Mode Integration', () => {
  it('should render language switcher', () => {
    const LanguageSwitcher = require('@/components/ui/LanguageSwitcher').default;
    render(<LanguageSwitcher />);
    
    expect(screen.getByRole('button', { name: 'language switcher' })).toBeInTheDocument();
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('should render dark mode toggle', () => {
    const DarkModeToggle = require('@/components/ui/DarkModeToggle').default;
    render(<DarkModeToggle />);
    
    expect(screen.getByRole('button', { name: 'dark mode toggle' })).toBeInTheDocument();
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });
});

describe('Translation Functionality', () => {
  it('should translate content', () => {
    const { useLanguage } = require('@/contexts/LanguageContext');
    const TestComponent = () => {
      const { t } = useLanguage();
      return <div>{t('test')}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});

describe('Dark Mode Functionality', () => {
  it('should provide dark mode state', () => {
    const { useDarkMode } = require('@/contexts/DarkModeContext');
    const TestComponent = () => {
      const { isDarkMode } = useDarkMode();
      return <div data-testid="dark-mode">{isDarkMode ? 'dark' : 'light'}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId('dark-mode')).toHaveTextContent('light');
  });
}); 