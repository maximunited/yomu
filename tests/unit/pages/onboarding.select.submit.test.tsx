import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingPage from '@/app/onboarding/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

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

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => [
    {
      id: 'brand1',
      name: 'Fox',
      logoUrl: '/images/brands/fox.png',
      category: 'fashion',
      isActive: true,
    },
    {
      id: 'brand2',
      name: 'Super-Pharm - LifeStyle',
      logoUrl: '/images/brands/super-pharm.png',
      category: 'health',
      isActive: true,
    },
  ],
});

describe('OnboardingPage select + submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows brand selection interactions', async () => {
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByText('Fox')).toBeInTheDocument();
    });
    expect(screen.getByText('Super-Pharm - LifeStyle')).toBeInTheDocument();

    const firstImg = screen.getAllByRole('img')[0];
    fireEvent.click(firstImg);

    expect(screen.getByText('Fox')).toBeInTheDocument();
  });
});
