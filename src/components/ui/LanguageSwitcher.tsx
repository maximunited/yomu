"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './Button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
    >
      <Globe className="w-4 h-4" />
      <span>{language === 'he' ? 'EN' : 'עב'}</span>
    </Button>
  );
} 