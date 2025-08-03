'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import PageHeader from "@/components/PageHeader";

const currentYear = new Date().getFullYear();

export default function TermsPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
    }`}>
      <PageHeader title={t('terms')} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('terms')}</h1>
            
            <div className={`space-y-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <section>
                <h2 className={`text-xl font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
                  קבלת התנאים
                </h2>
                <p className="leading-relaxed">
                  השימוש באתר YomU מהווה הסכמה לתנאי השימוש הללו. אם אינכם מסכימים לתנאים, אנא אל תשתמשו בשירות.
                </p>
              </section>

              <section>
                <h2 className={`text-xl font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Info className="w-5 h-5 ml-2 text-blue-600" />
                  שימוש בשירות
                </h2>
                <p className="leading-relaxed">
                  השירות מיועד לשימוש אישי בלבד. אסור להשתמש בשירות למטרות מסחריות או להפיץ מידע ללא אישור.
                </p>
              </section>

              <section>
                <h2 className={`text-xl font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 ml-2 text-yellow-600" />
                  אחריות
                </h2>
                <p className="leading-relaxed">
                  אנו משתדלים לספק מידע מדויק, אך איננו אחראים לטעויות או למידע לא מעודכן. 
                  יש לוודא את פרטי ההטבות ישירות אצל הספקים.
                </p>
              </section>

              <section>
                <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>שינויים בתנאים</h2>
                <p className="leading-relaxed">
                  אנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. שינויים יובאו לידיעת המשתמשים.
                </p>
              </section>

              <section>
                <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ביטול חשבון</h2>
                <p className="leading-relaxed">
                  ניתן לבטל את החשבון בכל עת דרך הגדרות החשבון. ביטול החשבון יביא למחיקת כל הנתונים הקשורים.
                </p>
              </section>

              <div className={`border-t pt-6 mt-8 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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