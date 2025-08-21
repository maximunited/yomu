"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Gift, Calendar, Star, Copy, ExternalLink } from "lucide-react";

interface Benefit {
  id: string;
  title: string;
  description: string;
  brand: {
    name: string;
    logoUrl: string;
  };
  promoCode?: string;
  url?: string;
  validityType: string;
  redemptionMethod: string;
  termsAndConditions?: string;
}

export default function DemoPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();

  const mockBenefits: Benefit[] = [
    {
      id: "1",
      title: "30% הנחה על כל הקנייה",
      description: "הטבה מיוחדת ליום הולדת - 30% הנחה על כל הקנייה בחנות",
      brand: {
        name: "Fox",
        logoUrl: "/images/brands/fox.png",
      },
      promoCode: "BDAY30",
      url: "https://fox.co.il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "הטבה תקפה לחודש יום ההולדת בלבד",
    },
    {
      id: "2",
      title: "קפה חינם",
      description: "קפה חינם ביום ההולדת שלך",
      brand: {
        name: "Starbucks",
        logoUrl: "/images/brands/starbucks.png",
      },
      validityType: "birthday_date",
      redemptionMethod: "אוטומטי באפליקציה",
      termsAndConditions: "תקף ביום ההולדת בלבד",
    },
    {
      id: "3",
      title: "הנחה של 50 ₪",
      description: "הנחה של 50 ₪ על קנייה מעל 200 ₪",
      brand: {
        name: "Super-Pharm",
        logoUrl: "/images/brands/super-pharm.png",
      },
      promoCode: "BDAY50",
      url: "https://super-pharm.co.il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "תקף לחודש יום ההולדת",
    },
    {
      id: "4",
      title: "מתנה חינם",
      description: "מתנה חינם על קנייה מעל 300 ₪",
      brand: {
        name: "H&M",
        logoUrl: "/images/brands/hm.png",
      },
      promoCode: "GIFT2024",
      url: "https://hm.com/il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "תקף לחודש יום ההולדת",
    },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getValidityText = (benefit: Benefit) => {
    switch (benefit.validityType) {
      case "birthday_date":
        return t("validOnlyOnBirthday");
      case "birthday_month":
        return t("validForEntireMonth");
      case "birthday_week":
        return t("validForWeek");
      default:
        return t("validForLimitedPeriod");
    }
  };

  const activeBenefits = mockBenefits.filter(
    (b) => b.validityType === "birthday_month",
  );
  const upcomingBenefits = mockBenefits.filter(
    (b) => b.validityType === "birthday_date",
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>YomU</span>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <LanguageSwitcher />
              <span className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                {t("demo") || "דמו"}
              </span>
              <Link href="/auth/signup">
                <Button size="sm">{t("getStarted")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            {t("welcome")} YomU! 🎉
          </h1>
          <p className={`mb-4 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {t("hereAreYourBirthdayBenefits")}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <Link
              href="/about"
              className="text-sm text-yellow-800 underline hover:text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
              aria-label={t("learnMore")}
            >
              💡 {t("learnMore")}
            </Link>
          </div>
        </div>

        {/* Active Now Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-purple-600" />
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              {t("activeNow")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBenefits.map((benefit) => (
              <div
                key={benefit.id}
                className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={benefit.brand.logoUrl}
                      alt={benefit.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {benefit.brand.name}
                    </h3>
                    <span className="text-sm text-purple-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>

                <h4 className={`font-bold text-lg mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {benefit.title}
                </h4>
                <p className={`text-sm mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  {benefit.description}
                </p>

                {benefit.promoCode && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {t("couponCode")}:
                    </span>
                    <code className="bg-purple-100 border border-purple-200 px-3 py-2 rounded-md text-sm font-mono text-purple-800 font-bold">
                      {benefit.promoCode}
                    </code>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => copyToClipboard(benefit.promoCode!)}
                      className={
                        copiedCode === benefit.promoCode
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }
                    >
                      {copiedCode === benefit.promoCode ? (
                        <span className="text-sm font-medium">
                          {t("copied")}
                        </span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex space-x-2">
                  {benefit.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(benefit.url, "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 ml-1" />
                      {t("buyNow")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              {t("comingSoon")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBenefits.map((benefit) => (
              <div
                key={benefit.id}
                className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow opacity-75 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={benefit.brand.logoUrl}
                      alt={benefit.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {benefit.brand.name}
                    </h3>
                    <span className="text-sm text-orange-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>

                <h4 className={`font-bold text-lg mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {benefit.title}
                </h4>
                <p className={`text-sm mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  {benefit.description}
                </p>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 opacity-50 cursor-not-allowed"
                  >
                    {t("moreDetails")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`rounded-xl shadow-lg p-8 text-center ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            {t("getStarted")}
          </h3>
          <p className={`mb-6 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>{t("signUpNow")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                {t("signUpNow")}
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8 py-3">
                {t("alreadyHaveAccount")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
