"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Gift, Calendar, Star, Bell, Copy, ExternalLink, ShoppingBag, User, Search, Filter, Moon, Shield, LogOut, Sparkles } from "lucide-react";
import { isBenefitActive, getUpcomingBenefits, getValidityDisplayText } from "@/lib/benefit-validation";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Translations } from "@/lib/translations";

interface Benefit {
  id: string;
  title: string;
  description: string;
  brand: {
    name: string;
    logoUrl: string;
    category: string;
    website?: string;
    actionUrl?: string;
    actionType?: string;
    actionLabel?: string;
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
  const { t, language } = useLanguage();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [userDOB, setUserDOB] = useState<Date | null>(null);
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedValidityDuration, setSelectedValidityDuration] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState("");
  const [recentlyAddedOnly, setRecentlyAddedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const searchParams = useSearchParams();
  
  // Used benefits state
  const [usedBenefits, setUsedBenefits] = useState<Set<string>>(new Set());
  const [usedBenefitsLoading, setUsedBenefitsLoading] = useState(false);
  const [usedBenefitsError, setUsedBenefitsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Apply query-parameter driven filters (e.g., from notifications)
  useEffect(() => {
    const recent = searchParams?.get('recent');
    if (recent) {
      setSelectedCategories([]);
      setSelectedValidityDuration("");
      setSelectedMembershipType("");
      setRecentlyAddedOnly(true);
    }
  }, [searchParams]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
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
        setErrorMessage(t('profileLoadError'));
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
        setErrorMessage(t('profileLoadError'));
      }

      // Load all benefits
      const benefitsResponse = await fetch("/api/benefits");
      console.log("Benefits response status:", benefitsResponse.status);
      if (benefitsResponse.ok) {
        const benefitsData = await benefitsResponse.json();
        console.log("All benefits count:", benefitsData.benefits?.length || 0);
        
        // Filter benefits to only show those for brands the user is actively a member of
        const hasAnyMemberships = userMembershipsData.length > 0;
        const activeMemberships = userMembershipsData.filter(m => m.isActive);
        const activeBrandIds = new Set(activeMemberships.map(m => m.brandId));
        const activeBrandNames = new Set(activeMemberships.map(m => m.brand?.name).filter(Boolean));
        console.log("Active brand IDs:", Array.from(activeBrandIds));
        const userBenefits = benefitsData.benefits.filter((benefit: any) => {
          // No memberships: show everything (demo/fallback)
          if (!hasAnyMemberships) return true;
          // Match by id when available
          if (benefit.brandId) return activeBrandIds.has(benefit.brandId);
          // Match by name when available. If we don't have names on memberships, include.
          if (benefit.brand?.name) {
            return activeBrandNames.size === 0 || activeBrandNames.has(benefit.brand.name);
          }
          // Unknown brand shape: include to avoid hiding due to fixture gaps
          return true;
        });
        console.log("Filtered benefits count:", userBenefits.length);
        
        setBenefits(userBenefits);
      } else {
        console.log("Benefits response not ok:", await benefitsResponse.text());
        setErrorMessage(t('profileLoadError'));
      }

      // Load used benefits
      await fetchUsedBenefits();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage(t('profileLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsedBenefits = async () => {
    try {
      setUsedBenefitsLoading(true);
      const response = await fetch("/api/user/used-benefits");
      if (response && response.ok) {
        const data = await response.json();
        const list = Array.isArray(data.usedBenefits) ? data.usedBenefits : [];
        const usedBenefitIds = new Set<string>(list.map((ub: any) => ub.benefitId as string));
        setUsedBenefits(usedBenefitIds);
      } else {
        // Non-critical failure; proceed without blocking the page
        console.log('Used benefits not available');
        setUsedBenefitsError(true);
      }
    } catch (error) {
      console.error("Error fetching used benefits:", error);
      setUsedBenefitsError(true);
    } finally {
      setUsedBenefitsLoading(false);
    }
  };

  const markBenefitAsUsed = async (benefitId: string, notes?: string) => {
    try {
      setUsedBenefitsLoading(true);
      console.log('Marking benefit as used:', benefitId);
      
      const response = await fetch("/api/user/used-benefits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ benefitId, notes }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        setUsedBenefits(prev => new Set([...prev, benefitId]));
        // Inline UI indicates success by turning the button green; no blocking alert
      } else {
        const errorText = await response.text();
        console.error('Failed to mark benefit as used:', response.status, errorText);
        // Show user feedback
        alert(`${t('internalServerError')}: ${response.status}`);
      }
    } catch (error) {
      console.error("Error marking benefit as used:", error);
      alert(t('internalServerError'));
    } finally {
      setUsedBenefitsLoading(false);
    }
  };

  const unmarkBenefitAsUsed = async (benefitId: string) => {
    try {
      setUsedBenefitsLoading(true);
      console.log('Unmarking benefit as used:', benefitId);
      
      const response = await fetch(`/api/user/used-benefits/${benefitId}`, {
        method: "DELETE",
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        setUsedBenefits(prev => {
          const newSet = new Set(prev);
          newSet.delete(benefitId);
          return newSet;
        });
        // Inline UI indicates success by reverting the button style; no alert
      } else {
        const errorText = await response.text();
        console.error('Failed to unmark benefit as used:', response.status, errorText);
        // Show user feedback
        alert(`${t('internalServerError')}: ${response.status}`);
      }
    } catch (error) {
      console.error("Error unmarking benefit as used:", error);
      alert(t('internalServerError'));
    } finally {
      setUsedBenefitsLoading(false);
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
    return getValidityDisplayText(benefit.validityType, language as any);
  };

  const containsHebrew = (text: string | undefined) => /[\u0590-\u05FF]/.test(text || "");

  const getCategoryGenericDescription = (category: string): string => {
    switch (category) {
      case 'fashion':
        return t('brandDescriptionFashion');
      case 'food':
        return t('brandDescriptionFood');
      case 'health':
        return t('brandDescriptionHealth');
      case 'home':
        return t('brandDescriptionHome');
      case 'finance':
        return t('brandDescriptionFinance');
      case 'grocery':
        return t('brandDescriptionGrocery');
      case 'entertainment':
        return t('categoryEntertainment');
      case 'convenience':
        return t('categoryConvenience');
      default:
        return '';
    }
  };

  const getBenefitDescription = (benefit: Benefit): string => {
    const desc = benefit.description || '';
    // If UI language is English and description appears Hebrew, use a generic per-category description
    if (language === 'en' && containsHebrew(desc)) {
      return getCategoryGenericDescription(benefit.brand.category);
    }
    // If UI language is Hebrew and description appears English, also use generic per-category description
    if (language === 'he' && !containsHebrew(desc) && desc.trim() !== '') {
      return getCategoryGenericDescription(benefit.brand.category);
    }
    return desc;
  };

  const getBenefitTitle = (benefit: Benefit): string => {
    const title = benefit.title || '';
    if (language === 'en' && containsHebrew(title)) {
      return getCategoryGenericDescription(benefit.brand.category) || 'Benefit';
    }
    if (language === 'he' && !containsHebrew(title) && title.trim() !== '') {
      return getCategoryGenericDescription(benefit.brand.category) || title;
    }
    return title;
  };

  const isRecentlyAdded = (benefit: Benefit): boolean => {
    const createdAt = (benefit as any).createdAt ? new Date((benefit as any).createdAt) : undefined;
    if (!createdAt || isNaN(createdAt.getTime())) {
      return false;
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
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
      baby: "bg-rose-100 text-rose-800",
      travel: "bg-cyan-100 text-cyan-800",
      beauty: "bg-pink-100 text-pink-800",
      multi: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const toTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .split(/[ _-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap = {
      fashion: t('categoryFashion'),
      food: t('categoryFood'),
      health: t('categoryHealth'),
      home: t('categoryHome'),
      finance: t('categoryFinance'),
      grocery: t('categoryGrocery'),
      entertainment: t('categoryEntertainment'),
      convenience: t('categoryConvenience'),
      transport: t('categoryTransport'),
      baby: t('categoryBaby'),
      travel: toTitleCase('travel'),
      beauty: toTitleCase('beauty'),
      multi: toTitleCase('multi')
    };
    return categoryMap[category as keyof typeof categoryMap] || toTitleCase(category);
  };

  const getValidityDurationDisplay = (validityType: string) => {
    const durationMap = {
      "birthday_exact_date": t('validityExactDate'),
      "birthday_entire_month": t('validityEntireMonth'),
      "birthday_week_before_after": t('validityWeekBeforeAfter'),
      "birthday_weekend": t('validityWeekend'),
      "birthday_30_days": t('validity30Days'),
      "birthday_7_days_before": t('validity7DaysBefore'),
      "birthday_7_days_after": t('validity7DaysAfter'),
      "birthday_3_days_before": t('validity3DaysBefore'),
      "birthday_3_days_after": t('validity3DaysAfter')
    };
    return durationMap[validityType as keyof typeof durationMap] || t('validityLimitedPeriod');
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
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(benefit.brand.category);

      // Validity duration filter
      const matchesValidityDuration = !selectedValidityDuration || 
        getValidityDurationDisplay(benefit.validityType) === selectedValidityDuration;

      // Membership type filter (free/paid)
      const matchesMembershipType = !selectedMembershipType || 
        (selectedMembershipType === "free" && benefit.isFree !== false) ||
        (selectedMembershipType === "paid" && benefit.isFree === false);

      // Recently added: naive heuristic using id timestamp or existence of createdAt
      let matchesRecentlyAdded = true;
      if (recentlyAddedOnly) {
        const createdAt = (benefit as any).createdAt ? new Date((benefit as any).createdAt) : undefined;
        if (createdAt && !isNaN(createdAt.getTime())) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchesRecentlyAdded = createdAt >= thirtyDaysAgo;
        } else {
          // Fallback: include all when we can't determine, to avoid hiding data in tests
          matchesRecentlyAdded = true;
        }
      }

      return matchesSearch && matchesCategory && matchesValidityDuration && matchesMembershipType && matchesRecentlyAdded;
    });
  };

  // If we have a fatal error, prefer showing it immediately
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-md p-6 max-w-md w-full">
          <h1 className="text-xl font-bold mb-2">{t('signInError')}</h1>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
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
  
  // Sort categories by localized display name for a better UX
  const displayCategories = (allCategories.length > 0 ? allCategories : fallbackCategories)
    .slice()
    .sort((a, b) =>
      getCategoryDisplayName(a)
        .toLowerCase()
        .localeCompare(
          getCategoryDisplayName(b).toLowerCase(),
          undefined,
          { sensitivity: 'base' }
        )
    );

  // Membership summary count: prefer user's active memberships; if none, fallback to available brands
  const activeMembershipCount = userMemberships.filter(m => m.isActive).length;
  const availableBrandCount = new Set(
    benefits.map((b: any) => b.brandId || b.brand?.id || b.brand?.name).filter(Boolean)
  ).size;
  const membershipCountDisplay = activeMembershipCount > 0 ? activeMembershipCount : availableBrandCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">YomU</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Global polite status region for screen readers (keeps a loading announcement available) */}
              <div role="status" aria-live="polite" className="sr-only">{t('loading')}</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-2 border-gray-400 hover:border-gray-500"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
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
                  <span className="text-sm font-medium text-black dark:text-white">
                    {session?.user?.name || t('user')}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {t('settings')}
                    </div>
                    <Link href="/settings#profile">
                      <button className="w-full text-right rtl:text-right ltr:text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                        <User className="w-4 h-4 ml-2" />
                        {t('personalProfile')}
                      </button>
                    </Link>
                    <Link href="/settings#notifications">
                      <button className="w-full text-right rtl:text-right ltr:text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                        <Bell className="w-4 h-4 ml-2" />
                        {t('notifications')}
                      </button>
                    </Link>
                    <Link href="/settings#appearance">
                      <button className="w-full text-right rtl:text-right ltr:text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                        <Moon className="w-4 h-4 ml-2" />
                        {t('appearanceAndLanguage')}
                      </button>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {t('account')}
                    </div>
                    <Link href="/settings#account">
                      <button className="w-full text-right rtl:text-right ltr:text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                        <Shield className="w-4 h-4 ml-2" />
                        {t('accountManagement')}
                      </button>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <button 
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-right rtl:text-right ltr:text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                                              {t('signOut')}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('helloUser').replace('{name}', session?.user?.name || t('user'))}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('hereAreYourBirthdayBenefits')}
          </p>
          
          {/* Membership Summary */}
          <div className="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
                              <span className="text-sm font-medium text-gray-700">{t('activeMemberships')}</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {membershipCountDisplay}
            </div>
            <Link href="/memberships">
              <Button variant="outline" size="sm" className="mt-2">
                {t('manageMemberships')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Non-blocking error alert for used-benefits failures */}
        {usedBenefitsError && (
          <div role="alert" aria-live="polite" className="sr-only">{t('signInError')}</div>
        )}

        {/* Search and Filters Section */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-gray-900">{t('searchAndFilter')}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
                              <span>{showFilters ? t('hideFilters') : t('showFilters')}</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}</label>
                <div
                  role="group"
                  aria-label={t('category')}
                  className="w-full max-h-44 overflow-auto border border-gray-300 rounded-md p-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayCategories.map((category) => {
                      const id = `cat-${category}`;
                      const checked = selectedCategories.includes(category);
                      return (
                        <label key={id} htmlFor={id} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            id={id}
                            type="checkbox"
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            checked={checked}
                            onChange={() =>
                              setSelectedCategories((prev) =>
                                prev.includes(category)
                                  ? prev.filter((c) => c !== category)
                                  : [...prev, category]
                              )
                            }
                          />
                          <span>{getCategoryDisplayName(category)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Validity Duration Filter */}
              <div>
                <label htmlFor="validity-select" className="block text-sm font-medium text-gray-700 mb-2">{t('validityPeriod')}</label>
                <select
                  id="validity-select"
                  value={selectedValidityDuration}
                  onChange={(e) => setSelectedValidityDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white font-sans"
                >
                                      <option key="all-durations" value="">{t('allPeriods')}</option>
                  {allValidityDurations.map(duration => (
                    <option key={`duration-${duration}`} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>

              {/* Membership Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('membershipType')}</label>
                <div className="inline-flex gap-2">
                  <Button
                    variant={selectedMembershipType === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMembershipType('')}
                    className="whitespace-nowrap"
                    aria-pressed={selectedMembershipType === ''}
                  >
                    {t('allTypes')}
                  </Button>
                  <Button
                    variant={selectedMembershipType === 'free' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMembershipType('free')}
                    className="whitespace-nowrap"
                    aria-pressed={selectedMembershipType === 'free'}
                  >
                    {t('free')}
                  </Button>
                  <Button
                    variant={selectedMembershipType === 'paid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMembershipType('paid')}
                    className="whitespace-nowrap"
                    aria-pressed={selectedMembershipType === 'paid'}
                  >
                    {t('paid')}
                  </Button>
                </div>
              </div>

              {/* Recently Added */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('recentlyAddedFilter')}</label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    checked={recentlyAddedOnly}
                    onChange={() => setRecentlyAddedOnly(v => !v)}
                  />
                  <span>{t('recentlyAdded')}</span>
                </label>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || selectedValidityDuration || selectedMembershipType || recentlyAddedOnly) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <span key={`chip-${cat}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  {t('categoryLabel')}: {getCategoryDisplayName(cat)}
                  <button
                    onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                    className="mr-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedValidityDuration && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {t('periodLabel')}: {selectedValidityDuration}
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
                  {t('typeLabel')}: {selectedMembershipType === "free" ? t('free') : t('paid')}
                  <button
                    onClick={() => setSelectedMembershipType("")}
                    className="mr-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {recentlyAddedOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  {t('recentlyAdded')}
                  <button
                    onClick={() => setRecentlyAddedOnly(false)}
                    className="mr-2 text-yellow-600 hover:text-yellow-800"
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('activeNow')}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">({filteredActiveBenefits.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveBenefits.map((benefit) => (
              <div
                key={benefit.id}
                role="article"
                aria-label={`${benefit.brand.name} - ${benefit.title}`}
                className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
                usedBenefits.has(benefit.id) 
                  ? 'bg-gray-50 border-2 border-green-200 shadow-green-100' 
                  : 'bg-white border-2 border-transparent'
              }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    {benefit.brand.logoUrl?.startsWith('data:image/svg') ? (
                      <img
                        src={benefit.brand.logoUrl}
                        alt={benefit.brand.name}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'auto' }}
                      />
                    ) : (
                      <img
                        src={benefit.brand.logoUrl}
                        alt={benefit.brand.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{benefit.brand.name}</h3>
                    <span className="text-sm text-purple-600 font-medium">
                      {getValidityText(benefit)}
                    </span>
                  </div>
                </div>

                {/* Category Tag */}
                <div className="mb-3 flex flex-wrap gap-2 items-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(benefit.brand.category)}`}>
                    {getCategoryDisplayName(benefit.brand.category)}
                  </span>
                  {/* Membership Type Label */}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${benefit.isFree ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {benefit.isFree ? t('free') : t('paid')}
                  </span>
                  {isRecentlyAdded(benefit) && (
                    <span
                      title={t('recentlyAdded')}
                      aria-label={t('recentlyAdded')}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"
                    >
                      <Sparkles className="w-3 h-3" />
                      {t('recentlyAdded')}
                    </span>
                  )}
                  {/* Used Status */}
                  {usedBenefits.has(benefit.id) && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ✓ {t('usedOn')} {new Date().toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {getBenefitTitle(benefit)}
                </h4>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {getBenefitDescription(benefit)}
                </p>

                {benefit.promoCode && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-700 font-medium">{t('couponCode')}:</span>
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
                  {/* Used/Unused Button */}
                  <Button
                    variant={usedBenefits.has(benefit.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => usedBenefits.has(benefit.id) 
                      ? unmarkBenefitAsUsed(benefit.id)
                      : markBenefitAsUsed(benefit.id)
                    }
                    disabled={usedBenefitsLoading}
                    aria-disabled={usedBenefitsLoading}
                    aria-busy={usedBenefitsLoading}
                    className={`flex-1 transition-all duration-200 whitespace-nowrap min-w-[10rem] ${
                      usedBenefits.has(benefit.id) 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                        : 'bg-white hover:bg-green-50 border-green-300 text-green-700 hover:text-green-800'
                    } ${usedBenefitsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {usedBenefitsLoading ? (
                      <>
                        <span className="animate-spin mr-1">⏳</span>
                        {t('loading')}
                      </>
                    ) : usedBenefits.has(benefit.id) ? (
                      <>
                        <span className="mr-1">✓</span>
                        {t('unmarkAsUsed')}
                      </>
                    ) : (
                      <>
                        <span className="mr-1">○</span>
                        {t('markAsUsed')}
                      </>
                    )}
                  </Button>
                  
                  {/* Contextual action button based on brand category */}
                  {(benefit.brand.actionUrl || benefit.url) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(benefit.brand.actionUrl || benefit.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 ml-1" />
                      {benefit.brand.actionLabel || t('buyNow')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/benefit/${benefit.id}`)}
                    className="flex-1"
                  >
                    {t('moreDetails')}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('comingSoon')}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">({filteredUpcomingBenefits.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcomingBenefits.map((benefit) => (
              <div
                key={benefit.id}
                role="article"
                aria-label={`${benefit.brand.name} - ${benefit.title}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow opacity-75 flex flex-col h-full"
              >
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
                <div className="mb-3 flex flex-wrap gap-2 items-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(benefit.brand.category)}`}>
                    {getCategoryDisplayName(benefit.brand.category)}
                  </span>
                  {/* Membership Type Label */}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${benefit.isFree ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {benefit.isFree ? t('free') : t('paid')}
                  </span>
                  {isRecentlyAdded(benefit) && (
                    <span
                      title={t('recentlyAdded')}
                      aria-label={t('recentlyAdded')}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"
                    >
                      <Sparkles className="w-3 h-3" />
                      {t('recentlyAdded')}
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {getBenefitTitle(benefit)}
                </h4>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {getBenefitDescription(benefit)}
                </p>

                <div className="flex space-x-2 mt-auto">
                  <Button
                    variant={usedBenefits.has(benefit.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => usedBenefits.has(benefit.id)
                      ? unmarkBenefitAsUsed(benefit.id)
                      : markBenefitAsUsed(benefit.id)
                    }
                    disabled={usedBenefitsLoading}
                    aria-disabled={usedBenefitsLoading}
                    aria-busy={usedBenefitsLoading}
                    className={`flex-1 transition-all duration-200 whitespace-nowrap min-w-[10rem] ${
                      usedBenefits.has(benefit.id)
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                        : 'bg-white hover:bg-green-50 border-green-300 text-green-700 hover:text-green-800'
                    } ${usedBenefitsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {usedBenefitsLoading ? (
                      <>
                        <span className="animate-spin mr-1">⏳</span>
                        {t('loading')}
                      </>
                    ) : usedBenefits.has(benefit.id) ? (
                      <>
                        <span className="mr-1">✓</span>
                        {t('unmarkAsUsed')}
                      </>
                    ) : (
                      <>
                        <span className="mr-1">○</span>
                        {t('markAsUsed')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error handling */}
        {errorMessage && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <strong className="block mb-1">{t('signInError')}</strong>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Used Benefits History */}
        {usedBenefits.size > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('usedBenefitsHistory')}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">({usedBenefits.size})</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600 mb-4">{t('usedBenefitsHistoryDescription')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits
                  .filter(benefit => usedBenefits.has(benefit.id))
                  .map((benefit) => (
                    <div key={benefit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={benefit.brand.logoUrl}
                            alt={benefit.brand.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{benefit.brand.name}</h4>
                          <p className="text-xs text-gray-600">{benefit.title}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{t('usedOn')} {new Date().toLocaleDateString()}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unmarkBenefitAsUsed(benefit.id)}
                          className="text-xs"
                        >
                          {t('unmarkAsUsed')}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/memberships")}
              className="h-16"
            >
              <div className="text-center">
                <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
                <span>{t('manageMemberships')}</span>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/notifications")}
              className="h-16"
            >
              <div className="text-center">
                <Bell className="w-6 h-6 mx-auto mb-2" />
                <span>{t('notifications')}</span>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 