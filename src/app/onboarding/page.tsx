'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Check,
  Gift,
  ShoppingBag,
  Coffee,
  Car,
  Plane,
  Heart,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  description: string;
}

/** Preferred onboarding brands by canonical DB name → i18n description key */
const POPULAR_BRAND_META: Record<
  string,
  { category: string; description: string; fallbackLogo: string }
> = {
  Fox: {
    category: 'fashion',
    description: 'brandDescriptionFashion',
    fallbackLogo: '/images/brands/fox.png',
  },
  'Super-Pharm - LifeStyle': {
    category: 'health',
    description: 'brandDescriptionHealth',
    fallbackLogo: '/images/brands/super-pharm.png',
  },
  "McDonald's": {
    category: 'food',
    description: 'brandDescriptionFood',
    fallbackLogo: '/images/brands/mcdonalds.png',
  },
  BBB: {
    category: 'home',
    description: 'brandDescriptionHome',
    fallbackLogo: '/images/brands/bbb.png',
  },
  'H&M': {
    category: 'fashion',
    description: 'brandDescriptionFashion',
    fallbackLogo: '/images/brands/hm.png',
  },
  Isracard: {
    category: 'finance',
    description: 'brandDescriptionFinance',
    fallbackLogo: '/images/brands/isracard.png',
  },
  Max: {
    category: 'fashion',
    description: 'brandDescriptionFashion',
    fallbackLogo: '/images/brands/max.png',
  },
  Starbucks: {
    category: 'food',
    description: 'brandDescriptionCoffee',
    fallbackLogo: '/images/brands/starbucks.png',
  },
  Shufersal: {
    category: 'grocery',
    description: 'brandDescriptionGrocery',
    fallbackLogo: '/images/brands/shufersal.png',
  },
  'Coffee Shop': {
    category: 'food',
    description: 'brandDescriptionCoffee',
    fallbackLogo: '/images/brands/coffee-shop.svg',
  },
};

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
  const { isLoaded } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBrandsLoading(true);
        const res = await fetch('/api/brands');
        if (!res.ok) throw new Error('brands fetch failed');
        const data = await res.json();
        const catalog: Array<{
          id: string;
          name: string;
          logoUrl?: string | null;
          category?: string;
        }> = Array.isArray(data) ? data : [];

        const preferred = Object.keys(POPULAR_BRAND_META)
          .map((name) => {
            const row = catalog.find((b) => b.name === name);
            if (!row) return null;
            const meta = POPULAR_BRAND_META[name];
            return {
              id: row.id,
              name: row.name,
              logoUrl: row.logoUrl || meta.fallbackLogo,
              category: row.category || meta.category,
              description: meta.description,
            } satisfies Brand;
          })
          .filter((b): b is Brand => b !== null);

        // If none of the preferred names exist, show first active brands from API
        const resolved =
          preferred.length > 0
            ? preferred
            : catalog.slice(0, 12).map((b) => ({
                id: b.id,
                name: b.name,
                logoUrl: b.logoUrl || '/images/brands/placeholder.svg',
                category: b.category || 'food',
                description: 'brandDescriptionFood',
              }));

        if (!cancelled) setBrands(resolved);
      } catch (error) {
        console.error('Failed to load onboarding brands:', error);
        if (!cancelled) setBrandsError(true);
      } finally {
        if (!cancelled) setBrandsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoaded || brandsLoading) {
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
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleSubmit = async () => {
    if (!dateOfBirth) {
      alert(t('dateOfBirth'));
      return;
    }
    if (selectedBrands.length === 0) {
      alert(t('onboardingSelectAtLeastOne'));
      return;
    }

    setIsLoading(true);
    try {
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateOfBirth,
          anniversaryDate: anniversaryDate || null,
        }),
      });
      if (!profileResponse.ok) {
        throw new Error(t('profileUpdateError'));
      }

      const response = await fetch('/api/user/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandIds: selectedBrands,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error(t('onboardingSaveError'));
      }
    } catch (error) {
      console.error('Error saving memberships:', error);
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

        {brandsError || brands.length === 0 ? (
          <div className="max-w-md mx-auto text-center space-y-4">
            <p className="text-gray-600">{t('profileLoadError')}</p>
            <Button onClick={() => router.push('/memberships')}>
              {t('onboardingContinueToDashboard')}
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 max-w-xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('onboardingDatesTitle')}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t('onboardingDatesDescription')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dateOfBirth')}
                  </label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('anniversaryDate')} ({t('optional')})
                  </label>
                  <Input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {brands.map((brand) => {
                const IconComponent =
                  categoryIcons[brand.category as keyof typeof categoryIcons] ||
                  Gift;
                const isSelected = selectedBrands.includes(brand.id);

                return (
                  <div
                    key={brand.id}
                    onClick={() => handleBrandToggle(brand.id)}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
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
                {t('onboardingSelectedCount').replace(
                  '{count}',
                  selectedBrands.length.toString()
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isLoading || selectedBrands.length === 0 || !dateOfBirth
                  }
                  className="px-8 py-3"
                >
                  {isLoading
                    ? t('onboardingSaving')
                    : t('onboardingContinueToDashboard')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-3"
                >
                  {t('onboardingSkipForNow')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
