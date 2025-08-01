"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Gift, Calendar, Star, Bell, Copy, ExternalLink, ChevronRight, ShoppingBag, User } from "lucide-react";

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
  validityDuration?: number;
  redemptionMethod: string;
  termsAndConditions?: string;
}

interface UserMembership {
  id: string;
  brandId: string;
  isActive: boolean;
  brand: {
    id: string;
    name: string;
    logoUrl: string;
    website: string;
    description: string;
    category: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load user's memberships first
      const membershipsResponse = await fetch("/api/user/memberships");
      let userMembershipsData: UserMembership[] = [];
      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json();
        userMembershipsData = membershipsData.memberships || [];
        setUserMemberships(userMembershipsData);
      }

      // Load all benefits
      const benefitsResponse = await fetch("/api/benefits");
      if (benefitsResponse.ok) {
        const benefitsData = await benefitsResponse.json();
        
        // Filter benefits to only show those for brands the user is a member of
        const userBrandIds = new Set(userMembershipsData.map(m => m.brandId));
        const userBenefits = benefitsData.benefits.filter((benefit: any) => 
          userBrandIds.has(benefit.brandId)
        );
        
        setBenefits(userBenefits);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
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

  const getCategoryColor = (category: string) => {
    const colors = {
      fashion: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      health: "bg-green-100 text-green-800",
      home: "bg-blue-100 text-blue-800",
      finance: "bg-yellow-100 text-yellow-800",
      grocery: "bg-pink-100 text-pink-800",
      entertainment: "bg-indigo-100 text-indigo-800",
      convenience: "bg-teal-100 text-teal-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Filter benefits based on validity type
  const activeBenefits = benefits.filter(b => b.validityType === "birthday_month");
  const upcomingBenefits = benefits.filter(b => b.validityType === "birthday_date");

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
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {session?.user?.name || "משתמש"}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/settings">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        הגדרות
                      </button>
                    </Link>
                    <button 
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      התנתקות
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            שלום {session?.user?.name || "משתמש"}! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            הנה ההטבות שלך ליום הולדת
          </p>
          
          {/* Membership Summary */}
          <div className="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">חברויות פעילות</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {userMemberships.filter(m => m.isActive).length}
            </div>
            <Link href="/memberships">
              <Button variant="outline" size="sm" className="mt-2">
                ניהול חברויות
              </Button>
            </Link>
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
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Copy className="w-4 h-4" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/benefit/${benefit.id}`)}
                    className="flex-1"
                  >
                    פרטים נוספים
                  </Button>
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
                    onClick={() => router.push(`/benefit/${benefit.id}`)}
                    className="flex-1"
                  >
                    פרטים נוספים
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/memberships")}
              className="h-16"
            >
              <div className="text-center">
                <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
                <span>ניהול חברויות</span>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/notifications")}
              className="h-16"
            >
              <div className="text-center">
                <Bell className="w-6 h-6 mx-auto mb-2" />
                <span>התראות</span>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="h-16"
            >
              <div className="text-center">
                <User className="w-6 h-6 mx-auto mb-2" />
                <span>פרופיל</span>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 