import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import DashboardPage from '@/app/dashboard/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Used Benefits Feature', () => {
  const mockSession = {
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (global.fetch as jest.Mock).mockClear();
  });

  it('should show mark as used button for unused benefits', async () => {
    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { dateOfBirth: '1990-01-01' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memberships: [{ brandId: 'brand1', isActive: true }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          benefits: [{
            id: 'benefit1',
            title: 'Test Benefit',
            brand: { name: 'Test Brand', logoUrl: '/test.png', category: 'food' },
            validityType: 'validityEntireMonth'
          }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          usedBenefits: []
        })
      });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Mark as Used')).toBeInTheDocument();
    });
  });

  it('should show unmark as used button for used benefits', async () => {
    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { dateOfBirth: '1990-01-01' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memberships: [{ brandId: 'brand1', isActive: true }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          benefits: [{
            id: 'benefit1',
            title: 'Test Benefit',
            brand: { name: 'Test Brand', logoUrl: '/test.png', category: 'food' },
            validityType: 'validityEntireMonth'
          }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          usedBenefits: [{ benefitId: 'benefit1' }]
        })
      });

    render(<DashboardPage />);

    await waitFor(() => {
      const buttons = screen.getAllByText('Unmark as Used');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should call mark benefit API when mark as used is clicked', async () => {
    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { dateOfBirth: '1990-01-01' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memberships: [{ brandId: 'brand1', isActive: true }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          benefits: [{
            id: 'benefit1',
            title: 'Test Benefit',
            brand: { name: 'Test Brand', logoUrl: '/test.png', category: 'food' },
            validityType: 'validityEntireMonth'
          }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          usedBenefits: []
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ usedBenefit: { id: 'used1', benefitId: 'benefit1' } })
      });

    render(<DashboardPage />);

    await waitFor(() => {
      const markButton = screen.getByText('Mark as Used');
      fireEvent.click(markButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/used-benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefitId: 'benefit1', notes: undefined }),
      });
    });
  });
}); 