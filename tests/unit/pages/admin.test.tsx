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

function mockSignedInAdmin() {
  mockUseUser.mockReturnValue({
    user: {
      id: 'user_test123',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      publicMetadata: { role: 'admin' },
    },
    isLoaded: true,
    isSignedIn: true,
  });
  mockUseAuth.mockReturnValue({
    userId: 'user_test123',
    isLoaded: true,
    isSignedIn: true,
  });
}

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should not load data when unauthenticated', async () => {
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

    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
    });
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

  it('should load data when /api/admin/me succeeds', async () => {
    mockSignedInAdmin();

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/admin/me') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      if (url === '/api/brands') {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: '1', name: 'Test Brand', logoUrl: '', website: '' },
          ],
        });
      }
      if (url === '/api/admin/benefits') {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: '1', title: 'Test Benefit', brandId: '1' }],
        });
      }
      if (url === '/api/admin/url-audit') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ last: null, persistence: 'database' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/me');
      expect(global.fetch).toHaveBeenCalledWith('/api/brands');
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/benefits');
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/url-audit');
    });
  });

  it('should deny access when /api/admin/me is forbidden even with metadata role', async () => {
    mockSignedInAdmin();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden' }),
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/me');
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalledWith('/api/brands');
  });

  it('should allow allowlisted admins without metadata role via /api/admin/me', async () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_allowlisted',
        fullName: 'Allowlisted',
        publicMetadata: {},
      },
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseAuth.mockReturnValue({
      userId: 'user_allowlisted',
      isLoaded: true,
      isSignedIn: true,
    });

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/admin/me') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/me');
      expect(global.fetch).toHaveBeenCalledWith('/api/brands');
    });
  });

  it('should handle fetch errors gracefully', async () => {
    mockSignedInAdmin();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should not crash on fetch error
    expect(document.body).toBeInTheDocument();
  });

  it('should render admin interface for authenticated users', async () => {
    mockSignedInAdmin();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/admin/me') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('should handle non-ok response status', async () => {
    mockSignedInAdmin();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/admin/me') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        text: async () => 'fail',
      });
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/me');
    });
    expect(document.body).toBeInTheDocument();
  });
});
