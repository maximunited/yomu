'use client';

import LanguageSelector from './LanguageSelector';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  return (
    <LanguageSelector 
      variant="compact" 
      showBeta={false}
      className={className}
    />
  );
} 