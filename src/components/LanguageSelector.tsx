'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getAvailableLanguages,
  getFullySupportedLanguages,
  getBetaLanguages,
  type LanguageCode,
} from '@/lib/languages';

interface LanguageSelectorProps {
  variant?: 'button' | 'dropdown' | 'compact';
  showBeta?: boolean;
  className?: string;
}

export default function LanguageSelector({
  variant = 'dropdown',
  showBeta = false,
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableLanguages = showBeta
    ? getAvailableLanguages()
    : getFullySupportedLanguages();
  const currentLanguage = availableLanguages.find(
    (lang) => lang.code === language
  );

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${className}`}
      >
        <GlobeAltIcon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <ChevronDownIcon className="w-3 h-3 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                    language === lang.code
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.isBeta && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        Beta
                      </span>
                    )}
                  </div>
                  {language === lang.code && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <GlobeAltIcon className="w-4 h-4 text-gray-500" />
          <span>{t('language')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-base">{currentLanguage?.flag}</span>
          <span className="text-sm">{currentLanguage?.name}</span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Fully supported languages */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('fullySupported')}
            </div>
            {getFullySupportedLanguages().map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  language === lang.code
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs text-gray-500">
                      {lang.englishName}
                    </span>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                )}
              </button>
            ))}

            {/* Beta languages */}
            {showBeta && getBetaLanguages().length > 0 && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('betaLanguages')}
                </div>
                {getBetaLanguages().map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 flex items-center justify-between ${
                      language === lang.code
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{lang.flag}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                            Beta
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {lang.englishName}
                        </span>
                      </div>
                    </div>
                    {language === lang.code && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
