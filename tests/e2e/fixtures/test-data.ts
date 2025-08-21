export const testUsers = {
  validUser: {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    dateOfBirth: "1990-07-15",
  },
  adminUser: {
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    dateOfBirth: "1985-03-10",
  },
};

export const testBrands = {
  mcdonalds: {
    name: "McDonald's",
    category: "food",
    description: "Fast food restaurant chain",
  },
  fox: {
    name: "Fox",
    category: "fashion",
    description: "Fashion and lifestyle brand",
  },
  superPharm: {
    name: "Super-Pharm",
    category: "health",
    description: "Pharmacy and health products",
  },
};

export const testBenefits = {
  birthdayMeal: {
    title: "Free Birthday Meal",
    description: "Get a free meal on your birthday",
    validityType: "birthday_exact_date",
    redemptionMethod: "in-store",
    isFree: true,
  },
  monthlyDiscount: {
    title: "20% Birthday Month Discount",
    description: "Get 20% off all month during your birthday month",
    validityType: "birthday_entire_month",
    redemptionMethod: "code",
    isFree: false,
    promoCode: "BIRTHDAY20",
  },
};

export const urls = {
  home: "/",
  signin: "/auth/signin",
  signup: "/auth/signup",
  dashboard: "/dashboard",
  memberships: "/memberships",
  onboarding: "/onboarding",
  settings: "/settings",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};
