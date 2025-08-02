"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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

  const mockBenefits: Benefit[] = [
    {
      id: "1",
      title: "30% הנחה על כל הקנייה",
      description: "הטבה מיוחדת ליום הולדת - 30% הנחה על כל הקנייה בחנות",
      brand: {
        name: "Fox",
        logoUrl: "/images/brands/fox.png"
      },
      promoCode: "BDAY30",
      url: "https://fox.co.il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "הטבה תקפה לחודש יום ההולדת בלבד"
    },
    {
      id: "2",
      title: "קפה חינם",
      description: "קפה חינם ביום ההולדת שלך",
      brand: {
        name: "Starbucks",
        logoUrl: "/images/brands/starbucks.png"
      },
      validityType: "birthday_date",
      redemptionMethod: "אוטומטי באפליקציה",
      termsAndConditions: "תקף ביום ההולדת בלבד"
    },
    {
      id: "3",
      title: "הנחה של 50 ₪",
      description: "הנחה של 50 ₪ על קנייה מעל 200 ₪",
      brand: {
        name: "Super-Pharm",
        logoUrl: "/images/brands/super-pharm.png"
      },
      promoCode: "BDAY50",
      url: "https://super-pharm.co.il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "תקף לחודש יום ההולדת"
    },
    {
      id: "4",
      title: "מתנה חינם",
      description: "מתנה חינם על קנייה מעל 300 ₪",
      brand: {
        name: "H&M",
        logoUrl: "/images/brands/hm.png"
      },
      promoCode: "GIFT2024",
      url: "https://hm.com/il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "תקף לחודש יום ההולדת"
    }
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
        return "תקף ביום ההולדת בלבד";
      case "birthday_month":
        return "תקף לכל החודש";
      case "birthday_week":
        return "תקף לשבוע";
      default:
        return "תקף לתקופה מוגבלת";
    }
  };

  const activeBenefits = mockBenefits.filter(b => b.validityType === "birthday_month");
  const upcomingBenefits = mockBenefits.filter(b => b.validityType === "birthday_date");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YomU</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">דמו</span>
              <Link href="/auth/signup">
                <Button size="sm">התחל עכשיו</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ברוכים הבאים ל-YomU! 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            הנה דוגמה של איך יראה הדשבורד שלכם
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              💡 זהו דמו עם נתונים לדוגמה. הירשמו כדי לראות את ההטבות האמיתיות שלכם!
            </p>
          </div>
        </div>

        {/* Active Now Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">פעיל עכשיו</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBenefits.map((benefit) => (
              <div key={benefit.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={benefit.brand.logoUrl}
                      alt={benefit.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.brand.name}</h3>
                    <span className="text-sm text-purple-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {benefit.description}
                </p>

                {benefit.promoCode && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-700 font-medium">קוד קופון:</span>
                    <code className="bg-purple-100 border border-purple-200 px-3 py-2 rounded-md text-sm font-mono text-purple-800 font-bold">
                      {benefit.promoCode}
                    </code>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => copyToClipboard(benefit.promoCode!)}
                      className={copiedCode === benefit.promoCode ? "bg-green-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700"}
                    >
                      {copiedCode === benefit.promoCode ? (
                        <span className="text-sm font-medium">✓ הועתק</span>
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
                      onClick={() => window.open(benefit.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 ml-1" />
                      לקנייה
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
            <h2 className="text-2xl font-bold text-gray-900">בקרוב</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBenefits.map((benefit) => (
              <div key={benefit.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow opacity-75">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={benefit.brand.logoUrl}
                      alt={benefit.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.brand.name}</h3>
                    <span className="text-sm text-orange-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {benefit.description}
                </p>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 opacity-50 cursor-not-allowed"
                  >
                    פרטים נוספים
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            מוכנים להתחיל?
          </h3>
          <p className="text-gray-600 mb-6">
            הירשמו עכשיו ותקבלו גישה לכל ההטבות ליום הולדת שלכם
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                הירשמו עכשיו - חינם
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8 py-3">
                יש לכם כבר חשבון? התחברו
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 