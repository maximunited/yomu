'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
);

// Helper function to safely get system dark mode preference
function getSystemDarkModePreference(): boolean {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);

    try {
      // Check for saved dark mode preference or default to system preference
      const savedDarkMode = localStorage.getItem('darkMode');

      if (savedDarkMode !== null) {
        // Validate the saved value is a proper boolean string
        if (savedDarkMode === 'true' || savedDarkMode === 'false') {
          setIsDarkMode(savedDarkMode === 'true');
        } else {
          // Invalid value, fall back to system preference
          localStorage.removeItem('darkMode');
          const systemPrefersDark = getSystemDarkModePreference();
          setIsDarkMode(systemPrefersDark);
        }
      } else {
        const systemPrefersDark = getSystemDarkModePreference();
        setIsDarkMode(systemPrefersDark);
      }
    } catch (error) {
      // Fallback to light mode if any error occurs
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to document only after hydration
    if (isHydrated) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, isHydrated]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    try {
      localStorage.setItem('darkMode', newDarkMode.toString());
    } catch (error) {
      // localStorage might be disabled or full
      console.warn('Failed to save dark mode preference:', error);
    }
  };

  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    try {
      localStorage.setItem('darkMode', dark.toString());
    } catch (error) {
      // localStorage might be disabled or full
      console.warn('Failed to save dark mode preference:', error);
    }
  };

  return (
    <DarkModeContext.Provider
      value={{ isDarkMode, toggleDarkMode, setDarkMode }}
    >
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
