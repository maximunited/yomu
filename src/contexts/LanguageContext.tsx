"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.he) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('he');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated and load language from localStorage
    setIsHydrated(true);
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'he' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isHydrated) {
      localStorage.setItem('language', lang);
      // Update document direction
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = (key: keyof typeof translations.he): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Set initial document direction only after hydration
    if (isHydrated) {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir, isHydrated]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 