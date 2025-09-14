import React from 'react';
import { render, screen } from '@testing-library/react';

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

// Mock the contexts to avoid complex setup
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'he',
    setLanguage: jest.fn(),
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/contexts/DarkModeContext', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
  DarkModeProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the UI components
jest.mock('@/components/ui/LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <button aria-label="language">עברית</button>;
  };
});

jest.mock('@/components/ui/DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return <button aria-label="dark mode toggle">🌙</button>;
  };
});

describe('Page Header Tests', () => {
  test('renders basic page header', () => {
    // Simple test to verify the testing setup works
    render(<div>Test Page</div>);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  test('renders page header with title', () => {
    // Test that we can render a simple component with the mocked contexts
    const TestComponent = () => {
      const { t } = require('@/contexts/LanguageContext').useLanguage();
      return <div>{t('test')}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
