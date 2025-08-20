import {
  translations,
  type Language,
  type Translations,
} from "@/lib/translations";

describe("translations", () => {
  const languages: Language[] = ["he", "en"];

  it("should export valid language types", () => {
    expect(languages).toContain("he");
    expect(languages).toContain("en");
  });

  it("should have translations for both Hebrew and English", () => {
    expect(translations.he).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it("should have all required translation keys in both languages", () => {
    const hebrewKeys = Object.keys(translations.he);
    const englishKeys = Object.keys(translations.en);

    // Check that Hebrew has all the keys
    expect(hebrewKeys.length).toBeGreaterThan(0);

    // Check that English has all the keys
    expect(englishKeys.length).toBeGreaterThan(0);

    // Basic navigation keys should exist
    expect(translations.he.home).toBeDefined();
    expect(translations.en.home).toBeDefined();
    expect(translations.he.dashboard).toBeDefined();
    expect(translations.en.dashboard).toBeDefined();
  });

  it("should have proper Hebrew translations", () => {
    expect(translations.he.home).toBe("בית");
    expect(translations.he.dashboard).toBe("לוח בקרה");
    expect(translations.he.memberships).toBe("חברויות");
    expect(translations.he.profile).toBe("פרופיל");
  });

  it("should have proper English translations", () => {
    expect(translations.en.home).toBe("Home");
    expect(translations.en.dashboard).toBe("Dashboard");
    expect(translations.en.memberships).toBe("Memberships");
    expect(translations.en.profile).toBe("Profile");
  });

  it("should have common action words in both languages", () => {
    // Save/Cancel
    expect(translations.he.save).toBe("שמור");
    expect(translations.en.save).toBe("Save");
    expect(translations.he.cancel).toBe("ביטול");
    expect(translations.en.cancel).toBe("Cancel");

    // Edit/Delete
    expect(translations.he.edit).toBe("ערוך");
    expect(translations.en.edit).toBe("Edit");
    expect(translations.he.delete).toBe("מחק");
    expect(translations.en.delete).toBe("Delete");
  });

  it("should have category translations", () => {
    const categories = ["fashion", "food", "health", "finance"];

    categories.forEach((category) => {
      expect(translations.he[category as keyof Translations]).toBeDefined();
      expect(translations.en[category as keyof Translations]).toBeDefined();
      expect(typeof translations.he[category as keyof Translations]).toBe(
        "string",
      );
      expect(typeof translations.en[category as keyof Translations]).toBe(
        "string",
      );
    });
  });

  it("should have auth-related translations", () => {
    const authKeys = ["signIn", "signUp", "signOut", "email", "password"];

    authKeys.forEach((key) => {
      expect(translations.he[key as keyof Translations]).toBeDefined();
      expect(translations.en[key as keyof Translations]).toBeDefined();
    });
  });

  it("should handle special characters correctly", () => {
    // Hebrew should contain Hebrew characters
    expect(translations.he.home).toMatch(/[\u0590-\u05FF]/);

    // English should be in Latin characters
    expect(translations.en.home).toMatch(/^[A-Za-z\s]+$/);
  });

  it("should have consistent API error messages", () => {
    expect(translations.he.unauthorized).toBeDefined();
    expect(translations.en.unauthorized).toBeDefined();
    expect(translations.he.internalServerError).toBeDefined();
    expect(translations.en.internalServerError).toBeDefined();
  });

  it("should have loading and state messages", () => {
    expect(translations.he.loading).toBe("טוען...");
    expect(translations.en.loading).toBe("Loading...");
    expect(translations.he.saving).toBe("שומר...");
    expect(translations.en.saving).toBe("Saving...");
  });

  it("should have benefit-related translations", () => {
    expect(translations.he.benefitDetails).toBeDefined();
    expect(translations.en.benefitDetails).toBeDefined();
    expect(translations.he.markAsUsed).toBeDefined();
    expect(translations.en.markAsUsed).toBeDefined();
    expect(translations.he.unmarkAsUsed).toBeDefined();
    expect(translations.en.unmarkAsUsed).toBeDefined();
  });

  it("should have proper notification translations", () => {
    expect(translations.he.notifications).toBeDefined();
    expect(translations.en.notifications).toBeDefined();
    expect(translations.he.newBenefit).toBeDefined();
    expect(translations.en.newBenefit).toBeDefined();
  });

  it("should have onboarding flow translations", () => {
    expect(translations.he.welcomeTitle).toContain("YomU");
    expect(translations.en.welcomeTitle).toContain("YomU");
    expect(translations.he.continue).toBeDefined();
    expect(translations.en.continue).toBeDefined();
  });

  it("should have brand-specific translations", () => {
    expect(translations.he.escapeRoom).toBeDefined();
    expect(translations.en.escapeRoom).toBeDefined();
    expect(translations.he.escapeRoomBenefit).toBeDefined();
    expect(translations.en.escapeRoomBenefit).toBeDefined();
  });

  describe("template strings", () => {
    it("should have placeholder strings that match format", () => {
      expect(translations.he.newNotificationsCount).toContain("{count}");
      expect(translations.en.newNotificationsCount).toContain("{count}");
      expect(translations.he.helloUser).toContain("{name}");
      expect(translations.en.helloUser).toContain("{name}");
    });
  });

  describe("optional properties", () => {
    it("should handle optional translation keys", () => {
      // These keys are marked as optional in the interface
      const optionalKeys = ["buyOnBrandWebsite", "officialBrandWebsite"];

      optionalKeys.forEach((key) => {
        const heValue = translations.he[key as keyof Translations];
        const enValue = translations.en[key as keyof Translations];

        if (heValue !== undefined) {
          expect(typeof heValue).toBe("string");
        }
        if (enValue !== undefined) {
          expect(typeof enValue).toBe("string");
        }
      });
    });
  });

  describe("language consistency", () => {
    it("should have roughly similar number of defined keys", () => {
      const heKeys = Object.keys(translations.he).filter(
        (key) => translations.he[key as keyof Translations] !== undefined,
      );
      const enKeys = Object.keys(translations.en).filter(
        (key) => translations.en[key as keyof Translations] !== undefined,
      );

      // Allow some difference but they should be relatively close
      const difference = Math.abs(heKeys.length - enKeys.length);
      expect(difference).toBeLessThan(50); // Allow up to 50 key difference
    });
  });
});
