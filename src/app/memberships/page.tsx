"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
} from "lucide-react";
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
  partnerBrands?: Brand[];
  partnerCount?: number;
}

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  description: string;
  category: string;
  partnerBrands?: Brand[];
  childBrands?: Brand[]; // For backward compatibility
  parentBrand?: Brand;
}

export default function MembershipsPage() {
  const { data: session, status } = useSession();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [customMembership, setCustomMembership] = useState({
    name: "",
    description: "",
    category: "",
    url: "",
    type: "free" as "free" | "paid",
    cost: "",
    partnerBrands: [] as string[],
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCustomMembershipDialog, setShowCustomMembershipDialog] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMembershipType, setSelectedMembershipType] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [originalMemberships, setOriginalMemberships] = useState<Membership[]>(
    [],
  );
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Load available brands from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load brands
        const brandsResponse = await fetch("/api/brands");
        if (brandsResponse.ok) {
          const brands = await brandsResponse.json();
          setAvailableBrands(brands);

          // Load user's existing memberships
          const userMembershipsResponse = await fetch("/api/user/memberships");
          let userMemberships: any[] = [];
          if (userMembershipsResponse.ok) {
            const userData = await userMembershipsResponse.json();
            userMemberships = userData.memberships || [];
          }

          // Create a set of active brand IDs for quick lookup
          const activeBrandIds = new Set(
            userMemberships.map((m: any) => m.brandId),
          );

          // Also fetch benefits to derive paid/free per brand when available
          const brandPaidMap = new Map<string, boolean>();
          const brandsWithBenefits = new Set<string>();
          try {
            const benefitsResp = await fetch("/api/benefits");
            if (benefitsResp.ok) {
              const data = await benefitsResp.json();
              const list = Array.isArray(data.benefits) ? data.benefits : [];
              for (const b of list) {
                if (b && b.brandId) {
                  if (b.isFree === false) brandPaidMap.set(b.brandId, true);
                  else if (!brandPaidMap.has(b.brandId))
                    brandPaidMap.set(b.brandId, false);
                  brandsWithBenefits.add(b.brandId);
                }
                // Fallbacks when brandId missing but brand object exists
                const candidate = (b &&
                  b.brand &&
                  (b.brand.id || b.brand.name)) as string | undefined;
                if (candidate) {
                  brandsWithBenefits.add(candidate);
                }
              }
            }
          } catch {}

          // Convert brands to memberships format with correct active state
          const brandMemberships: Membership[] = brands.map((brand: Brand) => {
            // Build description with partnership info
            let description = brand.description;
            const partners = brand.partnerBrands || brand.childBrands || [];
            if (partners.length > 0) {
              if (partners.length <= 2) {
                // Show full names for small partnerships
                const partnerNames = partners
                  .map((partner) => partner.name)
                  .join(", ");
                description += ` | ${t("includesAccessTo")}: ${partnerNames}`;
              } else {
                // Show count for larger partnerships to keep UI clean
                description += ` | ${t("includesAccessTo")} ${
                  partners.length
                } ${t("additionalBrands")}`;
              }
            }

            // Determine paid/free: prefer backend benefits flag; fallback to description heuristic
            const paidFromBenefits = brandPaidMap.get(brand.id);
            const inferredPaid =
              paidFromBenefits !== undefined
                ? paidFromBenefits
                : /₪|שנה|חודשי|subscription|paid|מסלול בתשלום/i.test(
                    brand.description || "",
                  );
            const membership: Membership = {
              id: brand.id,
              name: brand.name,
              description: description,
              category: brand.category,
              isActive:
                activeBrandIds.has(brand.id) ||
                brandsWithBenefits.has(brand.id) ||
                brandsWithBenefits.has(brand.name),
              icon: brand.logoUrl,
              type: inferredPaid ? ("paid" as const) : ("free" as const),
              cost: inferredPaid ? ((brand as any).cost ?? null) : null,
              partnerBrands: partners,
            };

            // Only add partnerCount if there are actually partners
            if (partners.length > 0) {
              membership.partnerCount = partners.length;
            }

            return membership;
          });

          setMemberships(brandMemberships);
          setOriginalMemberships(brandMemberships); // Initialize original memberships
        }
      } catch (error) {
        console.error("Error loading data:", error);
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
            cost: null,
          },
          {
            id: "2",
            name: "Super-Pharm - LifeStyle",
            description: "הטבות על מוצרי בריאות ויופי",
            category: "health",
            isActive: true,
            icon: "/images/brands/super-pharm.png",
            type: "free",
            cost: null,
          },
          {
            id: "3",
            name: "Fox",
            description: "הטבות על ביגוד והנעלה",
            category: "fashion",
            isActive: false,
            icon: "/images/brands/fox.png",
            type: "paid",
            cost: "₪99/שנה",
          },
          {
            id: "4",
            name: "Isracard",
            description: "הטבות על דלק ותחבורה",
            category: "transport",
            isActive: false,
            icon: "/images/brands/isracard.png",
            type: "free",
            cost: null,
          },
          {
            id: "5",
            name: "H&M",
            description: "הטבות על ביגוד והנעלה",
            category: "fashion",
            isActive: false,
            icon: "/images/brands/hm.png",
            type: "free",
            cost: null,
          },
          {
            id: "6",
            name: "BBB",
            description: "הטבות על מוצרי בית",
            category: "home",
            isActive: false,
            icon: "/images/brands/bbb.png",
            type: "free",
            cost: null,
          },
          {
            id: "7",
            name: "Shufersal",
            description: "הטבות על מוצרי מזון",
            category: "grocery",
            isActive: false,
            icon: "/images/brands/shufersal.png",
            type: "free",
            cost: null,
          },
          {
            id: "8",
            name: "KFC",
            description: "הטבות על מזון מהיר",
            category: "food",
            isActive: false,
            icon: "/images/brands/kfc.svg",
            type: "free",
            cost: null,
          },
          {
            id: "9",
            name: "אסקייפרום",
            description: "50 שח הנחה בחודש יומולדת",
            category: "entertainment",
            isActive: false,
            icon: "/images/brands/escape-room.svg",
            type: "free",
            cost: null,
          },
          {
            id: "10",
            name: "מסעדת באקרו (רעננה)",
            description: "מנה ראשונה וקינוח מתנה",
            category: "food",
            isActive: false,
            icon: "/images/brands/bacaro.svg",
            type: "free",
            cost: null,
          },
          {
            id: "11",
            name: "שגב (מסעדה)",
            description: "מנה ראשונה",
            category: "food",
            isActive: false,
            icon: "/images/brands/shegev.svg",
            type: "free",
            cost: null,
          },
          {
            id: "12",
            name: "ג'מס",
            description: "חצי ליטר בירה",
            category: "food",
            isActive: false,
            icon: "/images/brands/james.svg",
            type: "free",
            cost: null,
          },
          {
            id: "13",
            name: "פראג הקטנה (מסעדה)",
            description: "50 נק' מתנה",
            category: "food",
            isActive: false,
            icon: "/images/brands/prague.svg",
            type: "free",
            cost: null,
          },
          {
            id: "14",
            name: "מיקה חנויות נוחות",
            description: "10 שח מתנה בהצגת תעודה",
            category: "convenience",
            isActive: false,
            icon: "/images/brands/mika.svg",
            type: "free",
            cost: null,
          },
          {
            id: "15",
            name: "מנמ עשה זאת בעצמך",
            description: "50 שח מתנה (מעל 300)",
            category: "home",
            isActive: false,
            icon: "/images/brands/menam.svg",
            type: "free",
            cost: null,
          },
          {
            id: "16",
            name: "שילב",
            description: "הטבות על מוצרי תינוקות",
            category: "baby",
            isActive: false,
            icon: "/images/brands/shilav.svg",
            type: "free",
            cost: null,
          },
          {
            id: "17",
            name: "יומנגס",
            description: "הטבות על גלידה",
            category: "food",
            isActive: false,
            icon: "/images/brands/yomango.svg",
            type: "free",
            cost: null,
          },
          {
            id: "18",
            name: "M32 המבורגרים",
            description: "15% הנחה בחודש יומולדת",
            category: "food",
            isActive: false,
            icon: "/images/brands/m32.svg",
            type: "free",
            cost: null,
          },
          {
            id: "19",
            name: "מסעדת ליבירה",
            description: "בירה וקינוח בישיבה בלבד כל החודש",
            category: "food",
            isActive: false,
            icon: "/images/brands/libira.svg",
            type: "free",
            cost: null,
          },
        ]);
        setOriginalMemberships(memberships); // Ensure original memberships are set even on fallback
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session]);

  // Note: Do not early-return before all hooks are called. Authentication gates are placed later.

  const toggleMembership = (id: string) => {
    setMemberships((prev) =>
      prev.map((membership) =>
        membership.id === id
          ? { ...membership, isActive: !membership.isActive }
          : membership,
      ),
    );
  };

  const handleSaveChanges = async () => {
    const previousScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    if (!session) {
      console.error("No session available");
      alert(t("unauthorized"));
      router.push("/auth/signin");
      return;
    }

    setIsSaving(true);
    try {
      const activeBrandIds = memberships
        .filter((m) => m.isActive && !m.id.startsWith("custom-"))
        .map((m) => m.id);

      const activeCustomMemberships = memberships
        .filter((m) => m.isActive && m.id.startsWith("custom-"))
        .map((m) => ({
          name: m.name,
          description: m.description,
          category: m.category,
          icon: m.icon,
          type: m.type,
          cost: m.cost,
        }));

      console.log("Saving memberships:", {
        activeBrandIds,
        activeCustomMemberships,
      });

      const response = await fetch("/api/user/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandIds: activeBrandIds,
          customMemberships: activeCustomMemberships,
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Save successful:", result);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        setOriginalMemberships(memberships); // Update original memberships after successful save
        // Restore scroll position to avoid jump after resorting
        if (typeof window !== "undefined") {
          window.scrollTo(0, previousScrollY);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to save memberships:",
          response.status,
          errorData,
        );

        if (response.status === 401) {
          alert(t("unauthorized"));
          router.push("/auth/signin");
        } else if (response.status === 500) {
          alert(t("internalServerError"));
        } else {
          alert(t("profileUpdateError"));
        }
      }
    } catch (error) {
      console.error("Error saving memberships:", error);
      alert(t("internalServerError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomMembership = () => {
    if (
      customMembership.name &&
      customMembership.description &&
      customMembership.category
    ) {
      // Create partner brands array from available brands based on selected names
      const selectedPartnerBrands = availableBrands.filter((brand) =>
        customMembership.partnerBrands.includes(brand.name),
      );

      const newMembership: Membership = {
        id: `custom-${Date.now().toString()}`,
        name: customMembership.name,
        description: customMembership.description,
        category: customMembership.category,
        isActive: false,
        icon: "/images/brands/restaurant.svg",
        type: customMembership.type,
        cost:
          customMembership.type === "paid" && customMembership.cost
            ? customMembership.cost
            : null,
        partnerBrands: selectedPartnerBrands,
      };

      // Only add partnerCount if there are actually partners
      if (selectedPartnerBrands.length > 0) {
        newMembership.partnerCount = selectedPartnerBrands.length;
      }

      setMemberships((prev) => [...prev, newMembership]);
      // Also update originalMemberships to include the new membership as inactive
      setOriginalMemberships((prev) => [
        ...prev,
        { ...newMembership, isActive: false },
      ]);
      setCustomMembership({
        name: "",
        description: "",
        category: "",
        url: "",
        type: "free",
        cost: "",
        partnerBrands: [],
      });
      setShowCustomMembershipDialog(false);
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
      baby: "bg-rose-100 text-rose-800",
      travel: "bg-cyan-100 text-cyan-800",
      beauty: "bg-pink-100 text-pink-800",
      multi: "bg-gray-100 text-gray-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const hasChanges = () => {
    if (originalMemberships.length === 0) return false;

    // Check if any existing memberships have changed their active state
    const existingMembershipsChanged = memberships.some((current, index) => {
      const original = originalMemberships[index];
      return original && current.isActive !== original.isActive;
    });

    // Check if any new custom memberships have been added and are active
    const newActiveMemberships = memberships.filter(
      (m) =>
        !originalMemberships.some((original) => original.id === m.id) &&
        m.isActive,
    );

    return existingMembershipsChanged || newActiveMemberships.length > 0;
  };

  const isCustomMembershipFormValid = () => {
    const basicFieldsValid =
      customMembership.name.trim() !== "" &&
      customMembership.description.trim() !== "" &&
      customMembership.category !== "";

    // If it's a paid membership, cost is required
    const costValid =
      customMembership.type === "free" ||
      (customMembership.type === "paid" && customMembership.cost.trim() !== "");

    return basicFieldsValid && costValid;
  };

  const handlePartnerBrandToggle = (brandName: string) => {
    setCustomMembership((prev) => ({
      ...prev,
      partnerBrands: prev.partnerBrands.includes(brandName)
        ? prev.partnerBrands.filter((name) => name !== brandName)
        : [...prev.partnerBrands, brandName],
    }));
  };

  const getCategoryDisplayName = (category: string) => {
    // Always check translations first
    switch (category) {
      case "food":
        return t("food");
      case "health":
        return t("health");
      case "fashion":
        return t("fashion");
      case "transport":
        return t("transport");
      case "home":
        return t("homeCategory");
      case "finance":
      case "financial":
        return t("finance");
      case "grocery":
        return t("grocery");
      case "entertainment":
        return t("entertainment");
      case "convenience":
        return t("convenience");
      case "baby":
        return t("baby");
      case "travel":
        return "Travel";
      case "beauty":
        return "Beauty";
      case "multi":
        return "Multi-brand";
      default:
        return category; // fallback to the original category name if no translation
    }
  };

  const handleBackNavigation = () => {
    if (hasChanges()) {
      if (confirm(t("unsavedChangesWarning"))) {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  const activeCount = memberships.filter((m) => m.isActive).length;

  // Filter memberships based on search, category, and membership type
  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch =
      membership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(membership.category);
    const matchesMembershipType =
      !selectedMembershipType || membership.type === selectedMembershipType;
    return matchesSearch && matchesCategory && matchesMembershipType;
  });

  // Sort: active first based on original saved state to avoid reordering on toggle,
  // then alphabetical within groups using current language collator
  const originalActiveMap = useMemo(() => {
    const map = new Map<string, boolean>();
    originalMemberships.forEach((m) => map.set(m.id, m.isActive));
    return map;
  }, [originalMemberships]);

  const sortedMemberships = useMemo(() => {
    const collator = new Intl.Collator(language);
    return [...filteredMemberships].sort((a, b) => {
      const aActive = originalActiveMap.get(a.id) ?? a.isActive;
      const bActive = originalActiveMap.get(b.id) ?? b.isActive;
      if (aActive !== bActive) {
        return aActive ? -1 : 1;
      }
      return collator.compare(a.name, b.name);
    });
  }, [filteredMemberships, originalActiveMap, language]);

  // Authentication gates (placed after hooks to keep hook order stable)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t("loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackNavigation}
              >
                <ArrowLeft className="w-4 h-4 ml-1" />
                {t("back")}
              </Button>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t("manageMemberships")}
              </span>
            </div>
            <div className="flex items-center space-x-4 relative">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {activeCount} {t("activeOutOfTotal")} {memberships.length}
              </span>
              <div className="relative">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving || !hasChanges()}
                  className={`${
                    isSaving || !hasChanges()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {isSaving ? t("saving") : t("saveChanges")}
                </Button>

                {/* Success Message - positioned under save button */}
                {showSuccessMessage && (
                  <div className="absolute top-full right-0 mt-2 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap z-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>{t("changesSavedSuccessfully")}</span>
                    </div>
                  </div>
                )}
              </div>
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
              {t("membershipsDescription")}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4 font-sans">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="md:w-64">
                <div className="w-full max-h-40 overflow-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 font-sans">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "food",
                      "health",
                      "fashion",
                      "transport",
                      "home",
                      "finance",
                      "grocery",
                      "entertainment",
                      "convenience",
                      "baby",
                    ]
                      .map((key) => ({
                        key,
                        label: getCategoryDisplayName(key),
                      }))
                      .sort((a, b) =>
                        a.label
                          .toLowerCase()
                          .localeCompare(b.label.toLowerCase(), undefined, {
                            sensitivity: "base",
                          }),
                      )
                      .map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center text-sm capitalize"
                        >
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            checked={selectedCategories.includes(key)}
                            onChange={() =>
                              setSelectedCategories((prev) =>
                                prev.includes(key)
                                  ? prev.filter((c) => c !== key)
                                  : [...prev, key],
                              )
                            }
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {label}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMembershipType("")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMembershipType === ""
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {t("allTypes")}
              </button>
              <button
                onClick={() => setSelectedMembershipType("free")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMembershipType === "free"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {t("free")}
              </button>
              <button
                onClick={() => setSelectedMembershipType("paid")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMembershipType === "paid"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {t("paid")}
              </button>
            </div>
          </div>

          {/* Memberships Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sortedMemberships.map((membership) => (
              <div
                key={membership.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all cursor-pointer flex flex-col h-full ${
                  membership.isActive
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => toggleMembership(membership.id)}
              >
                {/* Header with icon, title, description, and checkbox */}
                <div className="flex items-start justify-between mb-3 flex-grow">
                  <div className="flex items-start space-x-3 flex-grow">
                    {membership.icon.startsWith("/") ||
                    membership.icon.startsWith("data:image") ? (
                      <img
                        src={membership.icon}
                        alt={membership.name}
                        className="w-8 h-8 rounded-full object-contain bg-white flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-2xl flex-shrink-0">
                        {membership.icon}
                      </span>
                    )}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {membership.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {membership.description}
                      </p>
                      {membership.partnerCount &&
                        membership.partnerCount > 0 &&
                        membership.partnerCount > 2 && (
                          <details className="mt-2">
                            <summary className="text-xs text-purple-600 cursor-pointer hover:text-purple-800">
                              {t("showBrandList")} ({membership.partnerCount})
                            </summary>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {membership.partnerBrands
                                ?.map((partner) => partner.name)
                                .join(" • ")}
                            </div>
                          </details>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {membership.isActive ? (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Tags section - always at bottom */}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                      membership.category,
                    )}`}
                  >
                    {getCategoryDisplayName(membership.category)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        membership.type === "paid"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {membership.type === "paid" ? t("paid") : t("free")}
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

          {/* Floating Add Button */}
          <button
            onClick={() => setShowCustomMembershipDialog(true)}
            className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-20"
            aria-label={t("addCustomMembership")}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </main>

      {/* Custom Membership Dialog */}
      {showCustomMembershipDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCustomMembershipDialog(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("addCustomMembership")}
              </h3>
              <button
                onClick={() => setShowCustomMembershipDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("customMembershipName")} *
                  </label>
                  <input
                    type="text"
                    placeholder={t("customMembershipName")}
                    value={customMembership.name}
                    onChange={(e) =>
                      setCustomMembership((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("categoryLabel")} *
                  </label>
                  <select
                    value={customMembership.category}
                    onChange={(e) =>
                      setCustomMembership((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  >
                    <option value="">{t("chooseCategory")}</option>
                    <option value="food">{t("food")}</option>
                    <option value="health">{t("health")}</option>
                    <option value="fashion">{t("fashion")}</option>
                    <option value="transport">{t("transport")}</option>
                    <option value="home">{t("homeCategory")}</option>
                    <option value="finance">{t("finance")}</option>
                    <option value="grocery">{t("grocery")}</option>
                    <option value="entertainment">{t("entertainment")}</option>
                    <option value="convenience">{t("convenience")}</option>
                    <option value="baby">{t("baby")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customMembershipDescription")} *
                </label>
                <textarea
                  placeholder={t("customMembershipDescription")}
                  value={customMembership.description}
                  onChange={(e) =>
                    setCustomMembership((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contact")}
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={customMembership.url}
                  onChange={(e) =>
                    setCustomMembership((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>

              {/* Membership Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("membershipType")}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="membershipType"
                      value="free"
                      checked={customMembership.type === "free"}
                      onChange={(e) =>
                        setCustomMembership((prev) => ({
                          ...prev,
                          type: e.target.value as "free" | "paid",
                          cost: "",
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t("free")}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="membershipType"
                      value="paid"
                      checked={customMembership.type === "paid"}
                      onChange={(e) =>
                        setCustomMembership((prev) => ({
                          ...prev,
                          type: e.target.value as "free" | "paid",
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t("paid")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Cost field - only show if paid */}
              {customMembership.type === "paid" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("membershipCost")} *
                  </label>
                  <input
                    type="text"
                    placeholder="₪99/שנה"
                    value={customMembership.cost}
                    onChange={(e) =>
                      setCustomMembership((prev) => ({
                        ...prev,
                        cost: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  />
                </div>
              )}

              {/* Partner Brands */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("partnerBrands")} ({t("optional")})
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {availableBrands.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableBrands.map((brand) => (
                        <label key={brand.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={customMembership.partnerBrands.includes(
                              brand.name,
                            )}
                            onChange={() =>
                              handlePartnerBrandToggle(brand.name)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {brand.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("loading")}
                    </p>
                  )}
                </div>
                {customMembership.partnerBrands.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {customMembership.partnerBrands.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowCustomMembershipDialog(false)}
                variant="outline"
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleAddCustomMembership}
                disabled={!isCustomMembershipFormValid()}
                className={`flex-1 ${
                  isCustomMembershipFormValid()
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {t("addMembership")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
