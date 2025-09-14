import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import SignInPage from '@/app/auth/signin/page';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
}));

// Mock the contexts
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        signIn: 'Sign In',
        welcome: 'Welcome',
        signInToYourAccount: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        saveEmail: 'Save Email',
        keepMeSignedIn: 'Keep Me Signed In',
        signingIn: 'Signing In',
        or: 'or',
        signInWithGoogle: 'Sign in with Google',
        signInWithGitHub: 'Sign in with GitHub',
        dontHaveAccount: "Don't have an account?",
        signUpNow: 'Sign up now',
        invalidCredentials: 'Invalid credentials',
        signInError: 'Sign in error',
        googleSignInError: 'Google sign in error',
        githubSignInError: 'GitHub sign in error',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/contexts/DarkModeContext', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
  }),
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => {
  return function MockPageHeader({ title }: { title: string }) {
    return <div data-testid="page-header">{title}</div>;
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

describe('SignIn Page Checkboxes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSignInPage = () => {
    return render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );
  };

  describe('Checkbox Functionality', () => {
    test('should render both checkboxes with correct labels', () => {
      renderSignInPage();

      // Check that both checkboxes are rendered
      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });
      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });

      expect(saveEmailCheckbox).toBeInTheDocument();
      expect(keepSignedInCheckbox).toBeInTheDocument();

      // Check that both checkboxes are unchecked by default
      expect(saveEmailCheckbox).not.toBeChecked();
      expect(keepSignedInCheckbox).not.toBeChecked();
    });

    test('should toggle "Save Email" checkbox when clicked', () => {
      renderSignInPage();

      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });

      // Initially unchecked
      expect(saveEmailCheckbox).not.toBeChecked();

      // Click to check
      fireEvent.click(saveEmailCheckbox);
      expect(saveEmailCheckbox).toBeChecked();

      // Click to uncheck
      fireEvent.click(saveEmailCheckbox);
      expect(saveEmailCheckbox).not.toBeChecked();
    });

    test('should toggle "Keep Me Signed In" checkbox when clicked', () => {
      renderSignInPage();

      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });

      // Initially unchecked
      expect(keepSignedInCheckbox).not.toBeChecked();

      // Click to check
      fireEvent.click(keepSignedInCheckbox);
      expect(keepSignedInCheckbox).toBeChecked();

      // Click to uncheck
      fireEvent.click(keepSignedInCheckbox);
      expect(keepSignedInCheckbox).not.toBeChecked();
    });

    test('should maintain independent state for both checkboxes', () => {
      renderSignInPage();

      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });
      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });

      // Check only "Save Email"
      fireEvent.click(saveEmailCheckbox);
      expect(saveEmailCheckbox).toBeChecked();
      expect(keepSignedInCheckbox).not.toBeChecked();

      // Check only "Keep Me Signed In"
      fireEvent.click(keepSignedInCheckbox);
      expect(saveEmailCheckbox).toBeChecked(); // Should remain checked
      expect(keepSignedInCheckbox).toBeChecked();

      // Uncheck "Save Email" only
      fireEvent.click(saveEmailCheckbox);
      expect(saveEmailCheckbox).not.toBeChecked();
      expect(keepSignedInCheckbox).toBeChecked(); // Should remain checked
    });

    test('should have proper accessibility attributes', () => {
      renderSignInPage();

      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });
      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });

      // Check that checkboxes have proper IDs
      expect(saveEmailCheckbox).toHaveAttribute('id', 'saveEmail');
      expect(keepSignedInCheckbox).toHaveAttribute('id', 'keepSignedIn');

      // Check that labels are properly associated with checkboxes
      const saveEmailLabel = screen.getByText('Save Email');
      const keepSignedInLabel = screen.getByText('Keep Me Signed In');

      expect(saveEmailLabel).toHaveAttribute('for', 'saveEmail');
      expect(keepSignedInLabel).toHaveAttribute('for', 'keepSignedIn');
    });

    test('should have proper styling classes', () => {
      renderSignInPage();

      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });
      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });

      // Check that checkboxes have the expected styling classes
      expect(saveEmailCheckbox).toHaveClass(
        'h-4',
        'w-4',
        'text-purple-600',
        'focus:ring-purple-500',
        'border-gray-300',
        'rounded'
      );
      expect(keepSignedInCheckbox).toHaveClass(
        'h-4',
        'w-4',
        'text-purple-600',
        'focus:ring-purple-500',
        'border-gray-300',
        'rounded'
      );
    });

    test('should be keyboard accessible', () => {
      renderSignInPage();

      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });
      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });

      // Test space key functionality
      saveEmailCheckbox.focus();
      fireEvent.keyDown(saveEmailCheckbox, { key: ' ', code: 'Space' });
      expect(saveEmailCheckbox).toBeChecked();

      keepSignedInCheckbox.focus();
      fireEvent.keyDown(keepSignedInCheckbox, { key: ' ', code: 'Space' });
      expect(keepSignedInCheckbox).toBeChecked();
    });
  });

  describe('Checkbox Layout and Spacing', () => {
    test('should have proper spacing between checkboxes', () => {
      renderSignInPage();

      const checkboxContainer = screen
        .getByRole('checkbox', { name: /save email/i })
        .closest('div');
      const nextCheckboxContainer = screen
        .getByRole('checkbox', { name: /keep me signed in/i })
        .closest('div');

      // Check that containers have proper spacing classes
      expect(checkboxContainer?.parentElement).toHaveClass('space-y-4');
    });

    test('should have proper alignment for checkbox and label', () => {
      renderSignInPage();

      const saveEmailContainer = screen
        .getByRole('checkbox', { name: /save email/i })
        .closest('div');
      const keepSignedInContainer = screen
        .getByRole('checkbox', { name: /keep me signed in/i })
        .closest('div');

      // Check that containers have proper flex alignment classes
      expect(saveEmailContainer).toHaveClass(
        'flex',
        'items-start',
        'space-x-3'
      );
      expect(keepSignedInContainer).toHaveClass(
        'flex',
        'items-start',
        'space-x-3'
      );
    });
  });

  describe('Checkbox State Persistence', () => {
    test('should maintain checkbox state during form interactions', async () => {
      renderSignInPage();

      const saveEmailCheckbox = screen.getByRole('checkbox', {
        name: /save email/i,
      });
      const keepSignedInCheckbox = screen.getByRole('checkbox', {
        name: /keep me signed in/i,
      });
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      // Check both checkboxes
      fireEvent.click(saveEmailCheckbox);
      fireEvent.click(keepSignedInCheckbox);

      // Interact with form inputs
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Checkboxes should remain checked
      expect(saveEmailCheckbox).toBeChecked();
      expect(keepSignedInCheckbox).toBeChecked();
    });
  });
});
