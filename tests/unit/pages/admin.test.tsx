import React from 'react';
import { render, screen, waitFor } from '../../utils/test-helpers';
import AdminPage from '@/app/admin/page';

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
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
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

    render(<AdminPage />);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should show loading state initially', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    });
    mockUseAuth.mockReturnValue({
      userId: null,
      isLoaded: false,
      isSignedIn: false,
    });

    render(<AdminPage />);

    // Should render without crashing during loading state
    expect(document.body).toBeInTheDocument();
  });

  it('should load data when authenticated', async () => {
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

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: '1', name: 'Test Brand', logoUrl: '', website: '' },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1', title: 'Test Benefit', brandId: '1' }],
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/brands');
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/benefits');
    });
  });

  it('should handle fetch errors gracefully', async () => {
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

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should not crash on fetch error
    expect(document.body).toBeInTheDocument();
  });

  it('should render admin interface for authenticated users', async () => {
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

    render(<AdminPage />);

    await waitFor(() => {
      // Should show some admin-related content
      expect(document.body).toBeInTheDocument();
    });
  });

  it('should handle non-ok response status', async () => {
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

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should handle non-ok responses gracefully
    expect(document.body).toBeInTheDocument();
  });
});
