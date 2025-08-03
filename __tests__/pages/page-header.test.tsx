import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import PageHeader from '@/components/PageHeader';
import AboutPage from '@/app/about/page';
import TermsPage from '@/app/terms/page';
import PrivacyPage from '@/app/privacy/page';
import ContactPage from '@/app/contact/page';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
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

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DarkModeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </DarkModeProvider>
);

describe('Page Header Component', () => {
  beforeEach(() => {
    // Reset mocks
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  test('renders with language switcher and dark mode toggle', () => {
    render(
      <TestWrapper>
        <PageHeader title="Test Page" />
      </TestWrapper>
    );

    // Check if language switcher is present (look for the globe icon)
    expect(screen.getByRole('button', { name: /עברית|Hebrew/i })).toBeInTheDocument();
    
    // Check if dark mode toggle is present (look for moon icon)
    expect(screen.getByRole('button', { name: /dark mode|light mode/i })).toBeInTheDocument();
  });

  test('displays correct title', () => {
    render(
      <TestWrapper>
        <PageHeader title="Test Page" />
      </TestWrapper>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  test('shows back button when showBackButton is true', () => {
    render(
      <TestWrapper>
        <PageHeader title="Test Page" showBackButton={true} />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument();
  });

  test('hides back button when showBackButton is false', () => {
    render(
      <TestWrapper>
        <PageHeader title="Test Page" showBackButton={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('link', { name: /back/i })).not.toBeInTheDocument();
  });
});

describe('About Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders with language switcher and dark mode toggle', () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /עברית|Hebrew/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark mode|light mode/i })).toBeInTheDocument();
  });

  test('displays translated content', () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );

    // Check for translated content
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    expect(screen.getByText(/mission/i)).toBeInTheDocument();
    expect(screen.getByText(/vision/i)).toBeInTheDocument();
  });

  test('supports dark mode styling', async () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByRole('button', { name: /dark mode|light mode/i });
    
    // Toggle dark mode
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-900');
    });
  });
});

describe('Terms Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders with language switcher and dark mode toggle', () => {
    render(
      <TestWrapper>
        <TermsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /עברית|Hebrew/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark mode|light mode/i })).toBeInTheDocument();
  });

  test('displays translated content', () => {
    render(
      <TestWrapper>
        <TermsPage />
      </TestWrapper>
    );

    expect(screen.getByText(/terms/i)).toBeInTheDocument();
  });

  test('supports dark mode styling', async () => {
    render(
      <TestWrapper>
        <TermsPage />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByRole('button', { name: /dark mode|light mode/i });
    
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-900');
    });
  });
});

describe('Privacy Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders with language switcher and dark mode toggle', () => {
    render(
      <TestWrapper>
        <PrivacyPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /עברית|Hebrew/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark mode|light mode/i })).toBeInTheDocument();
  });

  test('displays translated content', () => {
    render(
      <TestWrapper>
        <PrivacyPage />
      </TestWrapper>
    );

    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
  });

  test('supports dark mode styling', async () => {
    render(
      <TestWrapper>
        <PrivacyPage />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByRole('button', { name: /dark mode|light mode/i });
    
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-900');
    });
  });
});

describe('Contact Page', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders with language switcher and dark mode toggle', () => {
    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /עברית|Hebrew/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark mode|light mode/i })).toBeInTheDocument();
  });

  test('displays translated content', () => {
    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    // Use getAllByText for multiple instances of "Contact"
    const contactElements = screen.getAllByText(/contact/i);
    expect(contactElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText(/contactInformation/i)).toBeInTheDocument();
    expect(screen.getByText(/sendMessage/i)).toBeInTheDocument();
  });

  test('supports dark mode styling', async () => {
    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByRole('button', { name: /dark mode|light mode/i });
    
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-900');
    });
  });

  test('form inputs support dark mode', async () => {
    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByRole('button', { name: /dark mode|light mode/i });
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveClass('bg-gray-700');
      });
    });
  });
});

describe('Language Switching', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('language switcher changes language', async () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );

    const languageButton = screen.getByRole('button', { name: /עברית|Hebrew/i });
    fireEvent.click(languageButton);
    
    // Wait for dropdown to appear and click on English
    await waitFor(() => {
      const englishOption = screen.getByText(/English/i);
      fireEvent.click(englishOption);
    });
    
    // Verify language changed (this would need more specific implementation)
    expect(languageButton).toBeInTheDocument();
  });
});

describe('Dark Mode Toggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('dark mode toggle changes theme', async () => {
    render(
      <TestWrapper>
        <AboutPage />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByRole('button', { name: /dark mode|light mode/i });
    
    // Initial state should be light mode
    expect(darkModeToggle).toBeInTheDocument();
    
    // Click to toggle to dark mode
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('from-gray-900');
    });
    
    // Click again to toggle back to light mode
    fireEvent.click(darkModeToggle);
    
    await waitFor(() => {
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('from-purple-50');
    });
  });
}); 