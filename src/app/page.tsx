'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Gift, Calendar, Star, Users } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { DynamicYear } from "@/components/DynamicYear";
import { useTranslations } from 'next-intl';
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function HomePage() {
  const t = useTranslations();
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 text-gray-900'
    }`}>

      
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>YomU</span>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <LanguageSwitcher />
            <Link href="/auth/signin">
              <Button variant="outline" className="border-2 border-gray-400 hover:border-gray-500">{t('signIn')}</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>{t('signUp')}</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white`}>
            {t('heroTitle')}
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-4">
                {t('getStarted')}
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                {t('learnMore')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('feature1Title')}
              </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('feature1Description')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-pink-600" />
            </div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('feature2Title')}
              </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('feature2Description')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-orange-600" />
            </div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('feature3Title')}
              </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('feature3Description')}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mt-24 rounded-2xl p-8 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{t('statsBrands')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">200+</div>
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{t('statsBenefits')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">10K+</div>
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{t('statsUsers')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">₪500K+</div>
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{t('statsSaved')}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-24 py-12 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-900 text-white'}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">YomU</span>
          </div>
          <p className="text-gray-400 mb-4">
            © <DynamicYear /> YomU. {t('allRightsReserved')}.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400" dir="ltr">
            <Link href="/about" className="hover:text-white">{t('about')}</Link>
            <Link href="/privacy" className="hover:text-white">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-white">{t('terms')}</Link>
            <Link href="/contact" className="hover:text-white">{t('contact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
