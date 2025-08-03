"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Check, Gift, ShoppingBag, Coffee, Car, Plane, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  description: string;
}

const popularBrands: Brand[] = [
  {
    id: "fox-dream-card",
    name: "Fox - Dream Card",
    logoUrl: "/images/brands/fox.png",
    category: "fashion",
    description: "brandDescriptionFashion"
  },
  {
    id: "super-pharm-lifestyle",
    name: "Super-Pharm - LifeStyle",
    logoUrl: "/images/brands/super-pharm.png",
    category: "health",
    description: "brandDescriptionHealth"
  },
  {
    id: "mcdonalds",
    name: "McDonald's",
    logoUrl: "/images/brands/mcdonalds.png",
    category: "food",
    description: "brandDescriptionFood"
  },
  {
    id: "bbb",
    name: "BBB",
    logoUrl: "/images/brands/bbb.png",
    category: "home",
    description: "brandDescriptionHome"
  },
  {
    id: "hm",
    name: "H&M",
    logoUrl: "/images/brands/hm.png",
    category: "fashion",
    description: "brandDescriptionFashion"
  },
  {
    id: "isracard",
    name: "Isracard",
    logoUrl: "/images/brands/isracard.png",
    category: "finance",
    description: "brandDescriptionFinance"
  },
  {
    id: "max",
    name: "Max",
    logoUrl: "/images/brands/max.png",
    category: "fashion",
    description: "brandDescriptionFashion"
  },
  {
    id: "starbucks",
    name: "Starbucks",
    logoUrl: "/images/brands/starbucks.png",
    category: "food",
    description: "brandDescriptionCoffee"
  },
  {
    id: "shufersal",
    name: "Shufersal",
    logoUrl: "/images/brands/shufersal.png",
    category: "grocery",
    description: "brandDescriptionGrocery"
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    logoUrl: "/images/brands/coffee-shop.svg",
    category: "food",
    description: "brandDescriptionCoffee"
  }
];

const categoryIcons = {
  fashion: ShoppingBag,
  food: Coffee,
  health: Heart,
  home: Gift,
  finance: Car,
  grocery: ShoppingBag,
  travel: Plane,
};

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleSubmit = async () => {
    if (selectedBrands.length === 0) {
      alert(t('onboardingSelectAtLeastOne'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandIds: selectedBrands,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        throw new Error(t('onboardingSaveError'));
      }
    } catch (error) {
      console.error("Error saving memberships:", error);
      alert(t('onboardingSaveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">YomU</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('onboardingTitle')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('onboardingDescription')}
          </p>
        </div>

        {/* Brands Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {popularBrands.map((brand) => {
              const IconComponent = categoryIcons[brand.category as keyof typeof categoryIcons] || Gift;
              const isSelected = selectedBrands.includes(brand.id);

              return (
                <div
                  key={brand.id}
                  onClick={() => handleBrandToggle(brand.id)}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {brand.name}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {t(brand.description as keyof typeof t)}
                      </p>
                    </div>
                    <IconComponent className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {t('onboardingSelectedCount').replace('{count}', selectedBrands.length.toString())}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || selectedBrands.length === 0}
                className="px-8 py-3"
              >
                {isLoading ? t('onboardingSaving') : t('onboardingContinueToDashboard')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="px-8 py-3"
              >
                {t('onboardingSkipForNow')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 