import type { Benefit, Brand } from '@/types/admin';

describe('admin types — Benefit verification fields', () => {
  it('accepts Benefit with verified and lastChecked', () => {
    const benefit: Benefit = {
      id: 'b1',
      brandId: 'brand1',
      title: 'Happy BBBirthday — שתייה ומנה ראשונה',
      description: 'Drink + starter in birthday month',
      redemptionMethod: 'in-store',
      validityType: 'birthday_entire_month',
      isFree: true,
      isActive: true,
      verified: true,
      lastChecked: new Date('2026-08-01'),
    };

    expect(benefit.verified).toBe(true);
    expect(benefit.lastChecked).toEqual(new Date('2026-08-01'));
  });

  it('allows soft/uncertain benefits with verified false and null lastChecked', () => {
    const soft: Benefit = {
      id: 'b2',
      brandId: 'brand2',
      title: 'מתנת יום הולדת',
      description: 'Uncertain T&Cs',
      redemptionMethod: 'in-store',
      validityType: 'birthday_entire_month',
      isFree: true,
      isActive: true,
      verified: false,
      lastChecked: null,
    };

    expect(soft.verified).toBe(false);
    expect(soft.lastChecked).toBeNull();
  });

  it('keeps Brand shape compatible with catalog clubs', () => {
    const brand: Brand = {
      id: 'c1',
      name: 'יומנגס - Humongous',
      logoUrl: '/images/brands/restaurant.svg',
      website: 'https://www.humongous.co.il/fat',
      description: 'Humongous club',
      category: 'food',
      isActive: true,
      actionLabel: 'הצטרף למועדון',
    };

    expect(brand.name).toBe('יומנגס - Humongous');
    expect(brand.actionLabel).toBeDefined();
  });
});
