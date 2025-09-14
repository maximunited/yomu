'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import PageHeader from '@/components/PageHeader';

const currentYear = new Date().getFullYear();

export default function TermsPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
      }`}
    >
      <PageHeader title={t('terms')} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`rounded-xl shadow-lg p-8 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h1
              className={`text-3xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('terms')}
            </h1>

            <div
              className={`space-y-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <section>
                <h2
                  className={`text-xl font-semibold mb-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
                  {t('termsAcceptance')}
                </h2>
                <p className="leading-relaxed">
                  {t('termsAcceptanceDescription')}
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <Info className="w-5 h-5 ml-2 text-blue-600" />
                  {t('serviceUsage')}
                </h2>
                <p className="leading-relaxed">
                  {t('serviceUsageDescription')}
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 ml-2 text-yellow-600" />
                  {t('liability')}
                </h2>
                <p className="leading-relaxed">{t('liabilityDescription')}</p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('termsChanges')}
                </h2>
                <p className="leading-relaxed">
                  {t('termsChangesDescription')}
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('accountCancellation')}
                </h2>
                <p className="leading-relaxed">
                  {t('accountCancellationDescription')}
                </p>
              </section>

              <div
                className={`border-t pt-6 mt-8 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  © {currentYear} YomU. {t('allRightsReserved')}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
