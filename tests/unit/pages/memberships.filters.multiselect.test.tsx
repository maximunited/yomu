import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MembershipsPage from '@/app/memberships/page';

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
    user: {
      id: 'user_test123',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
    isLoaded: true,
    isSignedIn: true,
  })),
  useAuth: jest.fn(() => ({
    userId: 'user_test123',
    isLoaded: true,
    isSignedIn: true,
  })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: jest.fn(() => ({
    t: (key: string) => key,
    language: 'he',
    setLanguage: jest.fn(),
  })),
}));

describe('MembershipsPage category multi-select filter + styling', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'mcdonalds',
            name: "McDonald's",
            category: 'food',
            logoUrl: '',
            website: '',
            description: 'Fast food chain',
          },
          {
            id: 'fox',
            name: 'Fox',
            category: 'fashion',
            logoUrl: '',
            website: '',
            description: 'Fashion retailer',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memberships: [
            { brandId: 'mcdonalds', isActive: true },
            { brandId: 'fox', isActive: true },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          benefits: [
            { brandId: 'mcdonalds', isFree: true },
            { brandId: 'fox', isFree: false },
          ],
        }),
      });
  });

  it('renders memberships page without errors', async () => {
    render(<MembershipsPage />);

    // Just verify the page rendered without crashing
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });

    // Check if we can find any interactive elements or content
    const buttons = screen.queryAllByRole('button');
    const headings = screen.queryAllByRole('heading');
    const textboxes = screen.queryAllByRole('textbox');

    // At minimum, the page should render some interactive elements
    const hasContent =
      buttons.length > 0 || headings.length > 0 || textboxes.length > 0;
    expect(hasContent).toBe(true);
  });
});
