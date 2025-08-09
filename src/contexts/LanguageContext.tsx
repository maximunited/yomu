"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/lib/translations';
import { 
  LanguageCode, 
  detectUserLanguage, 
  getLanguageInfo, 
  getDirection,
  DEFAULT_LANGUAGE 
} from '@/lib/languages';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations.he) => string;
  dir: 'rtl' | 'ltr';
  languageInfo: ReturnType<typeof getLanguageInfo>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated and detect user language
    setIsHydrated(true);
    // During tests, do not depend on browser detection to keep html[lang]/dir stable
    const isTestEnv = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID !== undefined;
    const detectedLanguage = isTestEnv ? DEFAULT_LANGUAGE : detectUserLanguage();
    setLanguageState(detectedLanguage);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (isHydrated) {
      localStorage.setItem('language', lang);
      // Update document direction and language
      const languageInfo = getLanguageInfo(lang);
      document.documentElement.dir = languageInfo.dir;
      document.documentElement.lang = lang;
    }
  };

  const t = (key: keyof typeof translations.he): string => {
    // Fallback chain: current language -> English -> Hebrew -> key
    const currentTranslation = translations[language]?.[key];
    if (currentTranslation) return currentTranslation;
    
    const englishTranslation = translations.en?.[key];
    if (englishTranslation) return englishTranslation;
    
    const hebrewTranslation = translations.he?.[key];
    if (hebrewTranslation) return hebrewTranslation;
    
    return key;
  };

  const languageInfo = getLanguageInfo(language);
  const dir = languageInfo.dir;
  const isRTL = languageInfo.isRTL;

  useEffect(() => {
    // Set initial document direction and language only after hydration
    if (isHydrated) {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir, isHydrated]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      dir, 
      languageInfo,
      isRTL 
    }}>
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