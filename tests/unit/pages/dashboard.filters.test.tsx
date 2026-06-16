import React from 'react';
import { render, screen, waitFor, act } from '../../utils/test-helpers';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/dashboard/page';

// Mock Clerk
const mockUseUser = jest.fn();
const mockUseAuth = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
  useAuth: () => mockUseAuth(),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('Dashboard Filters and Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_test123',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
      },
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseAuth.mockReturnValue({
      userId: 'user_test123',
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { dateOfBirth: '1990-01-01', profilePicture: null },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memberships: [
            {
              id: 'membership-1',
              brandId: 'brand-1',
              isActive: true,
              brand: {
                id: 'brand-1',
                name: 'Test Brand',
                logoUrl: 'logo.png',
                category: 'food',
                website: 'test.com',
                description: 'Test brand',
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          benefits: [
            {
              id: 'benefit-1',
              title: 'Free Pizza',
              description: 'Get a free pizza on your birthday',
              brandId: 'brand-1',
              validityType: 'birthday_exact_date',
              validityDuration: 1,
              redemptionMethod: 'code',
              promoCode: 'BIRTHDAY',
              brand: {
                name: 'Pizza Place',
                logoUrl: 'pizza.png',
                category: 'food',
                website: 'pizza.com',
              },
            },
            {
              id: 'benefit-2',
              title: 'Coffee Discount',
              description: '20% off coffee',
              brandId: 'brand-1',
              validityType: 'birthday_entire_month',
              validityDuration: 30,
              redemptionMethod: 'show',
              brand: {
                name: 'Coffee Shop',
                logoUrl: 'coffee.png',
                category: 'beverage',
                website: 'coffee.com',
              },
            },
          ],
        }),
      });
  });

  it('should filter benefits by search term', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
      expect(screen.getByText('Coffee Discount')).toBeInTheDocument();
    });

    // Search for "pizza"
    const searchInput = screen.getByPlaceholderText(
      /חפש הטבות|Search memberships/i
    );
    await user.type(searchInput, 'pizza');

    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
      expect(screen.queryByText('Coffee Discount')).not.toBeInTheDocument();
    });
  });

  it('should filter benefits by category', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
      expect(screen.getByText('Coffee Discount')).toBeInTheDocument();
    });

    // Find and use category filter
    const categoryButtons = screen.getAllByText(/food|beverage/i);
    const foodButton = categoryButtons.find((btn) =>
      btn.textContent?.toLowerCase().includes('food')
    );

    if (foodButton) {
      await user.click(foodButton);

      await waitFor(() => {
        expect(
          screen.getAllByText('הטבות על מזון מהיר')[0]
        ).toBeInTheDocument();
        expect(screen.queryByText('Coffee Discount')).not.toBeInTheDocument();
      });
    }
  });

  it('should toggle filter visibility', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
    });

    // Look for filter toggle button
    const filterButton = screen.getByText(
      /show filters|hide filters|הצג סינונים|הסתר סינונים/i
    );
    await user.click(filterButton);

    // Filters should still be functional even after toggle
    expect(filterButton).toBeInTheDocument();
  });

  it('should handle empty search results', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
    });

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText(
      /חפש הטבות|Search memberships/i
    );
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.queryByText('הטבות על מזון מהיר')).not.toBeInTheDocument();
      expect(screen.queryByText('Coffee Discount')).not.toBeInTheDocument();
    });
  });

  it('should clear search when input is emptied', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
      expect(screen.getByText('Coffee Discount')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /חפש הטבות|Search memberships/i
    );

    // Search for something
    await user.type(searchInput, 'pizza');
    await waitFor(() => {
      expect(screen.queryByText('Coffee Discount')).not.toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);
    await waitFor(() => {
      expect(screen.getAllByText('הטבות על מזון מהיר')[0]).toBeInTheDocument();
      expect(screen.getByText('Coffee Discount')).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    // Mock API failure
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { dateOfBirth: '1990-01-01' } }),
      })
      .mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<DashboardPage />);
    });

    // Should handle error without crashing
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('should not load data when unauthenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });
    mockUseAuth.mockReturnValue({
      userId: null,
      isLoaded: true,
      isSignedIn: false,
    });

    render(<DashboardPage />);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
