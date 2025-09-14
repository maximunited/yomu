'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Shield, Eye, Lock, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import PageHeader from '@/components/PageHeader';

const currentYear = new Date().getFullYear();

export default function PrivacyPage() {
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
      <PageHeader title={t('privacy')} />

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
              {t('privacy')}
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
                  <Eye className="w-5 h-5 ml-2" />
                  {t('dataCollection')}
                </h2>
                <p className="leading-relaxed">
                  {t('dataCollectionDescription')}
                </p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <Lock className="w-5 h-5 ml-2" />
                  {t('security')}
                </h2>
                <p className="leading-relaxed">{t('securityDescription')}</p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <User className="w-5 h-5 ml-2" />
                  {t('userRights')}
                </h2>
                <p className="leading-relaxed">{t('userRightsDescription')}</p>
              </section>

              <section>
                <h2
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('policyUpdates')}
                </h2>
                <p className="leading-relaxed">
                  {t('policyUpdatesDescription')}
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
