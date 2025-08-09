export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  description: string;
  category: string;
  isActive: boolean;
  actionUrl?: string;
  actionType?: string;
  actionLabel?: string;
}

export interface Benefit {
  id: string;
  brandId: string;
  title: string;
  description: string;
  termsAndConditions?: string;
  redemptionMethod: string;
  promoCode?: string;
  url?: string;
  validityType: string;
  validityDuration?: number;
  isFree: boolean;
  isActive: boolean;
}


