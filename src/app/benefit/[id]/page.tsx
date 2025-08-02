"use client";

import { useState, useEffect } from "react";
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
  const [benefit, setBenefit] = useState<Benefit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchBenefit = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/benefits/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("הטבה לא נמצאה");
          } else {
            setError("שגיאה בטעינת ההטבה");
          }
          return;
        }
        
        const data = await response.json();
        setBenefit(data);
      } catch (error) {
        console.error("Error fetching benefit:", error);
        setError("שגיאה בטעינת ההטבה");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBenefit();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !benefit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 ml-1" />
                חזור
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YomU</span>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Brand Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={benefit.brand.logoUrl}
                  alt={benefit.brand.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{benefit.brand.name}</h1>
                <p className="text-gray-600">{benefit.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">
                {getValidityText(benefit.validityType)}
              </span>
            </div>
          </div>

          {/* Benefit Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">פרטי ההטבה</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">תיאור</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">אופן המימוש</h3>
                <p className="text-gray-600">{benefit.redemptionMethod}</p>
              </div>

              {benefit.promoCode && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">קוד קופון</h3>
                  <div className="flex items-center space-x-2">
                    <code className="bg-purple-100 border border-purple-200 px-4 py-2 rounded-md text-lg font-mono text-purple-800 font-bold">
                      {benefit.promoCode}
                    </code>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => copyToClipboard(benefit.promoCode!)}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copiedCode === benefit.promoCode && (
                    <p className="text-green-600 text-sm mt-2">✓ הועתק ללוח</p>
                  )}
                </div>
              )}

              {benefit.termsAndConditions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">תנאים והגבלות</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">{benefit.termsAndConditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">פעולות</h2>
            
            <div className="space-y-3">
              {benefit.url && (
                <Button
                  variant="default"
                  onClick={() => window.open(benefit.url, '_blank')}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  <ExternalLink className="w-5 h-5 ml-2" />
                  לקנייה באתר
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => window.open(benefit.brand.website, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-5 h-5 ml-2" />
                אתר המותג
              </Button>
              
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <AlertTriangle className="w-5 h-5 ml-2" />
                דווח על מידע שגוי או חסר
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 