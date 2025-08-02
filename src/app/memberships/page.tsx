"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, Circle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

interface Membership {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  icon: string;
  type: "free" | "paid";
  cost: string | null;
}

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  description: string;
  category: string;
}

export default function MembershipsPage() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [customMembership, setCustomMembership] = useState({
    name: "",
    description: "",
    category: ""
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Don't render anything while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">טוען...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  // Load available brands from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load brands
        const brandsResponse = await fetch('/api/brands');
        if (brandsResponse.ok) {
          const brands = await brandsResponse.json();
          setAvailableBrands(brands);
          
          // Load user's existing memberships
          const userMembershipsResponse = await fetch('/api/user/memberships');
          let userMemberships: any[] = [];
          if (userMembershipsResponse.ok) {
            const userData = await userMembershipsResponse.json();
            userMemberships = userData.memberships || [];
          }
          
          // Create a set of active brand IDs for quick lookup
          const activeBrandIds = new Set(userMemberships.map((m: any) => m.brandId));
          
          // Convert brands to memberships format with correct active state
          const brandMemberships: Membership[] = brands.map((brand: Brand) => ({
            id: brand.id,
            name: brand.name,
            description: brand.description,
            category: brand.category,
            isActive: activeBrandIds.has(brand.id),
            icon: brand.logoUrl,
            type: "free" as const,
            cost: null
          }));
          
          setMemberships(brandMemberships);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data if API fails
        setMemberships([
          {
            id: "1",
            name: "McDonald's",
            description: "הטבות על מזון מהיר",
            category: "food",
            isActive: true,
            icon: "/images/brands/mcdonalds.png",
            type: "free",
            cost: null
          },
          {
            id: "2",
            name: "Super-Pharm - LifeStyle",
            description: "הטבות על מוצרי בריאות ויופי",
            category: "health",
            isActive: true,
            icon: "/images/brands/super-pharm.png",
            type: "free",
            cost: null
          },
          {
            id: "3",
            name: "Fox - Dream Card",
            description: "הטבות על ביגוד והנעלה",
            category: "fashion",
            isActive: false,
            icon: "/images/brands/fox.png",
            type: "paid",
            cost: "₪99/שנה"
          },
          {
            id: "4",
            name: "Isracard",
            description: "הטבות על דלק ותחבורה",
            category: "transport",
            isActive: false,
            icon: "/images/brands/isracard.png",
            type: "free",
            cost: null
          },
          {
            id: "5",
            name: "H&M",
            description: "הטבות על ביגוד והנעלה",
            category: "fashion",
            isActive: false,
            icon: "/images/brands/hm.png",
            type: "free",
            cost: null
          },
          {
            id: "6",
            name: "BBB",
            description: "הטבות על מוצרי בית",
            category: "home",
            isActive: false,
            icon: "/images/brands/bbb.png",
            type: "free",
            cost: null
          },
          {
            id: "7",
            name: "Shufersal",
            description: "הטבות על מוצרי מזון",
            category: "grocery",
            isActive: false,
            icon: "/images/brands/shufersal.png",
            type: "free",
            cost: null
          },
          {
            id: "8",
            name: "KFC",
            description: "הטבות על מזון מהיר",
            category: "food",
            isActive: false,
            icon: "/images/brands/kfc.svg",
            type: "free",
            cost: null
          },
          {
            id: "9",
            name: "אסקייפרום",
            description: "50 שח הנחה בחודש יומולדת",
            category: "entertainment",
            isActive: false,
            icon: "/images/brands/escape-room.svg",
            type: "free",
            cost: null
          },
          {
            id: "10",
            name: "מסעדת באקרו (רעננה)",
            description: "מנה ראשונה וקינוח מתנה",
            category: "food",
            isActive: false,
            icon: "/images/brands/bacaro.svg",
            type: "free",
            cost: null
          },
          {
            id: "11",
            name: "שגב (מסעדה)",
            description: "מנה ראשונה",
            category: "food",
            isActive: false,
            icon: "/images/brands/shegev.svg",
            type: "free",
            cost: null
          },
          {
            id: "12",
            name: "ג'מס",
            description: "חצי ליטר בירה",
            category: "food",
            isActive: false,
            icon: "/images/brands/james.svg",
            type: "free",
            cost: null
          },
          {
            id: "13",
            name: "פראג הקטנה (מסעדה)",
            description: "50 נק' מתנה",
            category: "food",
            isActive: false,
            icon: "/images/brands/prague.svg",
            type: "free",
            cost: null
          },
          {
            id: "14",
            name: "מיקה חנויות נוחות",
            description: "10 שח מתנה בהצגת תעודה",
            category: "convenience",
            isActive: false,
            icon: "/images/brands/mika.svg",
            type: "free",
            cost: null
          },
          {
            id: "15",
            name: "מנמ עשה זאת בעצמך",
            description: "50 שח מתנה (מעל 300)",
            category: "home",
            isActive: false,
            icon: "/images/brands/menam.svg",
            type: "free",
            cost: null
          },
          {
            id: "16",
            name: "שילב",
            description: "הטבות על מוצרי תינוקות",
            category: "baby",
            isActive: false,
            icon: "/images/brands/shilav.svg",
            type: "free",
            cost: null
          },
          {
            id: "17",
            name: "יומנגוס",
            description: "הטבות על גלידה",
            category: "food",
            isActive: false,
            icon: "/images/brands/yomango.svg",
            type: "free",
            cost: null
          },
          {
            id: "18",
            name: "M32 המבורגרים",
            description: "15% הנחה בחודש יומולדת",
            category: "food",
            isActive: false,
            icon: "/images/brands/m32.svg",
            type: "free",
            cost: null
          },
          {
            id: "19",
            name: "מסעדת ליבירה",
            description: "בירה וקינוח בישיבה בלבד כל החודש",
            category: "food",
            isActive: false,
            icon: "/images/brands/libira.svg",
            type: "free",
            cost: null
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session]);

  const toggleMembership = (id: string) => {
    setMemberships(prev => 
      prev.map(membership => 
        membership.id === id 
          ? { ...membership, isActive: !membership.isActive }
          : membership
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!session) {
      console.error('No session available');
      alert('אנא התחבר מחדש כדי לשמור את השינויים');
      router.push('/auth/signin');
      return;
    }
    
    setIsSaving(true);
    try {
      const activeBrandIds = memberships
        .filter(m => m.isActive)
        .map(m => m.id);

      console.log('Saving memberships:', activeBrandIds);

      const response = await fetch('/api/user/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brandIds: activeBrandIds }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save memberships:', response.status, errorData);
        
        if (response.status === 401) {
          alert('הסשן פג תוקף. אנא התחבר מחדש.');
          router.push('/auth/signin');
        } else if (response.status === 500) {
          alert('שגיאה בשרת. אנא נסה שוב מאוחר יותר.');
        } else {
          alert('שגיאה בשמירת החברויות. אנא נסה שוב.');
        }
      }
    } catch (error) {
      console.error('Error saving memberships:', error);
      alert('שגיאה בשמירת החברויות. אנא נסה שוב.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomMembership = () => {
    if (customMembership.name && customMembership.description && customMembership.category) {
      const newMembership: Membership = {
        id: Date.now().toString(),
        name: customMembership.name,
        description: customMembership.description,
        category: customMembership.category,
        isActive: false,
        icon: "/images/brands/restaurant.svg",
        type: "free",
        cost: null
      };
      setMemberships(prev => [...prev, newMembership]);
      setCustomMembership({ name: "", description: "", category: "" });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      health: "bg-green-100 text-green-800",
      fashion: "bg-purple-100 text-purple-800",
      transport: "bg-blue-100 text-blue-800",
      home: "bg-yellow-100 text-yellow-800",
      grocery: "bg-pink-100 text-pink-800",
      entertainment: "bg-indigo-100 text-indigo-800",
      convenience: "bg-teal-100 text-teal-800",
      baby: "bg-rose-100 text-rose-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const activeCount = memberships.filter(m => m.isActive).length;

  // Filter memberships based on search and category
  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || membership.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">טוען חברויות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  חזרה
                </Button>
              </Link>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ניהול חברויות</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {activeCount} מתוך {memberships.length} פעילים
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              בחרו את כל תוכניות החברות שלכם כדי שנוכל להציג לכם את כל ההטבות ליום הולדת
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="חפש חברויות..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">כל הקטגוריות</option>
                  <option value="food">מזון</option>
                  <option value="health">בריאות</option>
                  <option value="fashion">אופנה</option>
                  <option value="transport">תחבורה</option>
                  <option value="home">בית</option>
                  <option value="grocery">מזון</option>
                  <option value="entertainment">בידור</option>
                  <option value="convenience">נוחות</option>
                  <option value="baby">תינוקות</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === "" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                הכל
              </button>
              <button
                onClick={() => setSelectedCategory("food")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === "food" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                מזון
              </button>
              <button
                onClick={() => setSelectedCategory("fashion")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === "fashion" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                אופנה
              </button>
              <button
                onClick={() => setSelectedCategory("health")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === "health" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                בריאות
              </button>
            </div>
          </div>

          {/* Memberships Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredMemberships.map((membership) => (
              <div
                key={membership.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all cursor-pointer ${
                  membership.isActive
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => toggleMembership(membership.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {membership.icon.startsWith('/') ? (
                      <img
                        src={membership.icon}
                        alt={membership.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{membership.icon}</span>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {membership.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {membership.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {membership.isActive ? (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(membership.category)}`}>
                    {membership.category === "food" && "מזון"}
                    {membership.category === "health" && "בריאות"}
                    {membership.category === "fashion" && "אופנה"}
                    {membership.category === "transport" && "תחבורה"}
                    {membership.category === "home" && "בית"}
                    {membership.category === "grocery" && "מזון"}
                    {membership.category === "entertainment" && "בידור"}
                    {membership.category === "convenience" && "נוחות"}
                    {membership.category === "baby" && "תינוקות"}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      membership.type === "free" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {membership.type === "free" ? "חינם" : "בתשלום"}
                    </span>
                    {membership.cost && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {membership.cost}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  חברויות פעילות: {activeCount} מתוך {memberships.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  חברויות חינמיות: {memberships.filter(m => m.type === "free" && m.isActive).length}
                </p>
              </div>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? "שומר..." : "שמור שינויים"}
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>החברויות נשמרו בהצלחה!</p>
            </div>
          )}

          {/* Custom Membership Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              הוסף חברות מותאמת אישית
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="שם החברות"
                value={customMembership.name}
                onChange={(e) => setCustomMembership(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                placeholder="תיאור"
                value={customMembership.description}
                onChange={(e) => setCustomMembership(prev => ({ ...prev, description: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                value={customMembership.category}
                onChange={(e) => setCustomMembership(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">בחר קטגוריה</option>
                <option value="food">מזון</option>
                <option value="health">בריאות</option>
                <option value="fashion">אופנה</option>
                <option value="transport">תחבורה</option>
                <option value="home">בית</option>
                <option value="grocery">מזון</option>
                <option value="entertainment">בידור</option>
                <option value="convenience">נוחות</option>
                <option value="baby">תינוקות</option>
              </select>
            </div>
            <Button
              onClick={handleAddCustomMembership}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white"
            >
              הוסף חברות
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 