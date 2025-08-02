"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Gift, Calendar, Star, Bell, Copy, ExternalLink, ShoppingBag, User, Search, Filter } from "lucide-react";
import { isBenefitActive, getUpcomingBenefits, getValidityDisplayText } from "@/lib/benefit-validation";

interface Benefit {
  id: string;
  title: string;
  description: string;
  brand: {
    name: string;
    logoUrl: string;
    category: string;
  };
  promoCode?: string;
  url?: string;
  validityType: string;
  validityDuration?: number;
  redemptionMethod: string;
  termsAndConditions?: string;
  isFree?: boolean;
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
  const [userDOB, setUserDOB] = useState<Date | null>(null);
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedValidityDuration, setSelectedValidityDuration] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
      
      console.log("=== Starting to fetch user data ===");
      
      // Load user's profile to get DOB and profile picture
      const profileResponse = await fetch("/api/user/profile");
      console.log("Profile response status:", profileResponse.status);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log("Profile data:", profileData);
        if (profileData.user.dateOfBirth) {
          setUserDOB(new Date(profileData.user.dateOfBirth));
          console.log("Set user DOB:", new Date(profileData.user.dateOfBirth));
        }
        if (profileData.user.profilePicture) {
          setUserProfilePicture(profileData.user.profilePicture);
          console.log("Set user profile picture");
        }
      } else {
        console.log("Profile response not ok:", await profileResponse.text());
      }
      
      // Load user's memberships first
      const membershipsResponse = await fetch("/api/user/memberships");
      console.log("Memberships response status:", membershipsResponse.status);
      let userMembershipsData: UserMembership[] = [];
      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json();
        userMembershipsData = membershipsData.memberships || [];
        setUserMemberships(userMembershipsData);
        console.log("User memberships:", userMembershipsData.length);
      } else {
        console.log("Memberships response not ok:", await membershipsResponse.text());
      }

      // Load all benefits
      const benefitsResponse = await fetch("/api/benefits");
      console.log("Benefits response status:", benefitsResponse.status);
      if (benefitsResponse.ok) {
        const benefitsData = await benefitsResponse.json();
        console.log("All benefits count:", benefitsData.benefits?.length || 0);
        
        // Filter benefits to only show those for brands the user is a member of
        const userBrandIds = new Set(userMembershipsData.map(m => m.brandId));
        console.log("User brand IDs:", Array.from(userBrandIds));
        const userBenefits = benefitsData.benefits.filter((benefit: any) => 
          userBrandIds.has(benefit.brandId)
        );
        console.log("Filtered benefits count:", userBenefits.length);
        
        setBenefits(userBenefits);
      } else {
        console.log("Benefits response not ok:", await benefitsResponse.text());
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
    return getValidityDisplayText(benefit.validityType);
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
      transport: "bg-blue-100 text-blue-800",
      baby: "bg-rose-100 text-rose-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames = {
      fashion: "אופנה",
      food: "מזון",
      health: "בריאות",
      home: "בית",
      finance: "פיננסי",
      grocery: "מזון",
      entertainment: "בידור",
      convenience: "נוחות",
      transport: "תחבורה",
      baby: "תינוקות"
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  const getValidityDurationDisplay = (validityType: string) => {
    const durationMap = {
      "birthday_exact_date": "יום אחד",
      "birthday_entire_month": "חודש שלם",
      "birthday_week_before_after": "שבועיים",
      "birthday_weekend": "סוף שבוע",
      "birthday_30_days": "30 ימים",
      "birthday_7_days_before": "7 ימים לפני",
      "birthday_7_days_after": "7 ימים אחרי",
      "birthday_3_days_before": "3 ימים לפני",
      "birthday_3_days_after": "3 ימים אחרי"
    };
    return durationMap[validityType as keyof typeof durationMap] || "תקופה מוגבלת";
  };

  // Filter benefits based on search and filters
  const filterBenefits = (benefits: Benefit[]) => {
    return benefits.filter(benefit => {
      // Search filter
      const matchesSearch = !searchTerm || 
        benefit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        benefit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        benefit.brand.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !selectedCategory || benefit.brand.category === selectedCategory;

      // Validity duration filter
      const matchesValidityDuration = !selectedValidityDuration || 
        getValidityDurationDisplay(benefit.validityType) === selectedValidityDuration;

      // Membership type filter (free/paid)
      const matchesMembershipType = !selectedMembershipType || 
        (selectedMembershipType === "free" && benefit.isFree !== false) ||
        (selectedMembershipType === "paid" && benefit.isFree === false);

      return matchesSearch && matchesCategory && matchesValidityDuration && matchesMembershipType;
    });
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

  // Get current month (0-based, so August is 7)
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();
  
  // Debug logging
  console.log("Current month:", currentMonth, "Current day:", currentDay);
  console.log("User DOB:", userDOB);
  if (userDOB) {
    console.log("User birthday month:", userDOB.getMonth(), "User birthday day:", userDOB.getDate());
  }
  
  // Filter benefits based on validity type and user's birthday
  console.log("=== Filtering benefits ===");
  console.log("Total benefits:", benefits.length);
  console.log("Benefits with validity types:", benefits.map(b => ({ id: b.id, validityType: b.validityType })));
  
  const activeBenefits = benefits.filter(b => {
    return isBenefitActive(b, userDOB);
  });
  
  console.log("Active benefits count:", activeBenefits.length);
  
  const upcomingBenefits = benefits.filter(b => {
    return getUpcomingBenefits(b, userDOB);
  });
  
  console.log("Upcoming benefits count:", upcomingBenefits.length);

  // Apply search and filters
  const filteredActiveBenefits = filterBenefits(activeBenefits);
  const filteredUpcomingBenefits = filterBenefits(upcomingBenefits);

  // Get unique categories from benefits
  const allCategories = Array.from(new Set(benefits.map(b => b.brand.category).filter(Boolean)));
  const allValidityDurations = Array.from(new Set(benefits.map(b => getValidityDurationDisplay(b.validityType))));

  // Debug logging for categories
  console.log("Benefits with categories:", benefits.map(b => ({ 
    brand: b.brand.name, 
    category: b.brand.category 
  })));
  console.log("All categories found:", allCategories);

  // Fallback categories if none are found in benefits
  const fallbackCategories = [
    'food', 'health', 'fashion', 'home', 'finance', 'grocery', 
    'entertainment', 'convenience', 'transport', 'baby'
  ];
  
  const displayCategories = allCategories.length > 0 ? allCategories : fallbackCategories;

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
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfilePicture ? (
                      <img 
                        src={userProfilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
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

        {/* Search and Filters Section */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">חיפוש וסינון</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? "הסתר סינון" : "הצג סינון"}</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="חפש הטבות, מותגים או תיאורים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  <option key="all" value="">כל הקטגוריות</option>
                  {displayCategories.map(category => (
                    <option key={`category-${category}`} value={category}>
                      {getCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Validity Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תקופת תוקף</label>
                <select
                  value={selectedValidityDuration}
                  onChange={(e) => setSelectedValidityDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  <option key="all-durations" value="">כל התקופות</option>
                  {allValidityDurations.map(duration => (
                    <option key={`duration-${duration}`} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>

              {/* Membership Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג חברות</label>
                <select
                  value={selectedMembershipType}
                  onChange={(e) => setSelectedMembershipType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  <option key="all-types" value="">כל הסוגים</option>
                  <option key="free" value="free">חינם</option>
                  <option key="paid" value="paid">בתשלום</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedCategory || selectedValidityDuration || selectedMembershipType) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  קטגוריה: {getCategoryDisplayName(selectedCategory)}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="mr-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedValidityDuration && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  תקופה: {selectedValidityDuration}
                  <button
                    onClick={() => setSelectedValidityDuration("")}
                    className="mr-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMembershipType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  סוג: {selectedMembershipType === "free" ? "חינם" : "בתשלום"}
                  <button
                    onClick={() => setSelectedMembershipType("")}
                    className="mr-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Active Now Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">פעיל עכשיו</h2>
              <span className="text-sm text-gray-500">({filteredActiveBenefits.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveBenefits.map((benefit) => (
              <div key={benefit.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={benefit.brand.logoUrl}
                      alt={benefit.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{benefit.brand.name}</h3>
                    <span className="text-sm text-purple-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>

                {/* Category Tag */}
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(benefit.brand.category)}`}>
                    {getCategoryDisplayName(benefit.brand.category)}
                  </span>
                  {/* Membership Type Label */}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${benefit.isFree ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {benefit.isFree ? 'חינם' : 'בתשלום'}
                  </span>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
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

                <div className="flex space-x-2 mt-auto">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">בקרוב</h2>
              <span className="text-sm text-gray-500">({filteredUpcomingBenefits.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcomingBenefits.map((benefit) => (
              <div key={benefit.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow opacity-75 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={benefit.brand.logoUrl}
                      alt={benefit.brand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{benefit.brand.name}</h3>
                    <span className="text-sm text-orange-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>

                {/* Category Tag */}
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(benefit.brand.category)}`}>
                    {getCategoryDisplayName(benefit.brand.category)}
                  </span>
                  {/* Membership Type Label */}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${benefit.isFree ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {benefit.isFree ? 'חינם' : 'בתשלום'}
                  </span>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {benefit.description}
                </p>

                <div className="flex space-x-2 mt-auto">
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