'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Gift } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDarkMode } from "@/contexts/DarkModeContext";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function PageHeader({ title, showBackButton = true, backHref = "/" }: PageHeaderProps) {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();

  return (
    <header className={`shadow-sm border-b transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Link href={backHref}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  {t('back')}
                </Button>
              </Link>
            )}
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
} 