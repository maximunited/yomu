"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Users, Target, Eye, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  {t('back')}
                </Button>
              </Link>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t('about')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('aboutTitle')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('aboutDescription')}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('mission')}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('missionDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-pink-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('vision')}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('visionDescription')}
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-orange-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('team')}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contributorsDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">מפתח ראשי</h3>
                <p className="text-gray-600 dark:text-gray-300">Lead Developer</p>
              </div>

              <div className="text-center p-4">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">מעצב UX/UI</h3>
                <p className="text-gray-600 dark:text-gray-300">UX/UI Designer</p>
              </div>

              <div className="text-center p-4">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">מנהל מוצר</h3>
                <p className="text-gray-600 dark:text-gray-300">Product Manager</p>
              </div>
            </div>
          </div>

          {/* Contributors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t('contributors')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">תורמי תוכן</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  אנשים שתרמו מידע על הטבות יום הולדת
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">בודקי איכות</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  צוות הבודק את דיוק המידע
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 