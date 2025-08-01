"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, ExternalLink, Calendar, Info, Gift, AlertTriangle } from "lucide-react";

interface Benefit {
  id: string;
  title: string;
  description: string;
  brand: {
    name: string;
    logoUrl: string;
    website: string;
  };
  promoCode?: string;
  url?: string;
  validityType: string;
  redemptionMethod: string;
  termsAndConditions?: string;
  howToRedeem?: string;
}

export default function BenefitDetailPage() {
  const params = useParams();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Mock data - in real app this would come from API
  const mockBenefits: Record<string, Benefit> = {
    "1": {
      id: "1",
      title: "30% הנחה על כל הקנייה",
      description: "הטבה מיוחדת ליום הולדת - 30% הנחה על כל הקנייה בחנות Fox. הטבה תקפה לחודש יום ההולדת בלבד.",
      brand: {
        name: "Fox",
        logoUrl: "/images/brands/fox.png",
        website: "https://fox.co.il"
      },
      promoCode: "BDAY30",
      url: "https://fox.co.il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "הטבה תקפה לחודש יום ההולדת בלבד. לא ניתן לשלב עם הטבות אחרות. תקף בחנויות Fox בלבד.",
      howToRedeem: "הצג את הקוד בקופה או הזן אותו באתר בעת הקנייה"
    },
    "3": {
      id: "3",
      title: "הנחה של 50 ₪",
      description: "הנחה של 50 ₪ על קנייה מעל 200 ₪ ברשת Super-Pharm. הטבה תקפה לחודש יום ההולדת.",
      brand: {
        name: "Super-Pharm",
        logoUrl: "/images/brands/superpharm.png",
        website: "https://super-pharm.co.il"
      },
      promoCode: "BDAY50",
      url: "https://super-pharm.co.il",
      validityType: "birthday_month",
      redemptionMethod: "קוד קופון",
      termsAndConditions: "תקף לחודש יום ההולדת. מינימום קנייה 200 ₪. לא ניתן לשלב עם הטבות אחרות.",
      howToRedeem: "הצג את הקוד בקופה או הזן אותו באפליקציה"
    }
  };

  const benefit = mockBenefits[params.id as string];

  if (!benefit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">הטבה לא נמצאה</h1>
            <p className="text-gray-600 mb-6">ההטבה שביקשת לא קיימת או הוסרה.</p>
            <Link href="/dashboard">
              <Button>חזור לדשבורד</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getValidityText = (validityType: string) => {
    switch (validityType) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  חזרה
                </Button>
              </Link>
              <span className="text-xl font-bold text-gray-900">פרטי הטבה</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Brand Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={benefit.brand.logoUrl}
                  alt={benefit.brand.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{benefit.brand.name}</h1>
                <span className="text-sm text-purple-600 font-medium">
                  {getValidityText(benefit.validityType)}
                </span>
              </div>
            </div>

            {/* Benefit Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{benefit.title}</h2>
            <p className="text-gray-600 text-lg mb-6">{benefit.description}</p>

            {/* Promo Code Section */}
            {benefit.promoCode && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Gift className="w-5 h-5 ml-2 text-purple-600" />
                  קוד קופון
                </h3>
                <div className="flex items-center space-x-3">
                  <code className="bg-white border border-purple-300 px-4 py-3 rounded-md text-lg font-mono text-purple-800 font-bold flex-1">
                    {benefit.promoCode}
                  </code>
                  <Button
                    variant="default"
                    onClick={() => copyToClipboard(benefit.promoCode!)}
                    className={copiedCode === benefit.promoCode ? "bg-green-600" : ""}
                  >
                    {copiedCode === benefit.promoCode ? (
                      <span className="text-sm font-medium">✓ הועתק</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* How to Redeem */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="w-5 h-5 ml-2 text-blue-600" />
                איך לממש
              </h3>
              <p className="text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
                {benefit.howToRedeem || benefit.redemptionMethod}
              </p>
            </div>

            {/* Terms and Conditions */}
            {benefit.termsAndConditions && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">תנאים והגבלות</h3>
                <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {benefit.termsAndConditions}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-4">
              {benefit.url && (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => window.open(benefit.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 ml-2" />
                  לקנייה באתר
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.open(benefit.brand.website, '_blank')}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                אתר המותג
              </Button>
            </div>

            {/* Report Button */}
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  // In a real app, this would open a report form or modal
                  alert("תודה על הדיווח! נבדוק את המידע ונעדכן בהקדם.");
                }}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <AlertTriangle className="w-4 h-4 ml-2" />
                דווח על מידע שגוי או חסר
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 