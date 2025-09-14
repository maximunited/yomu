import {
  VALIDITY_TYPES,
  LEGACY_VALIDITY_TYPES,
  validateBenefitData,
  getValidityDisplayText,
  isBenefitActive,
  getUpcomingBenefits,
  ALL_VALIDITY_TYPES,
} from "@/lib/benefit-validation";

describe("Benefit Validation", () => {
  // Suppress expected warnings from unknown validity types in specific tests
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  afterAll(() => warnSpy.mockRestore());
  describe("VALIDITY_TYPES", () => {
    it("should contain all expected validity types", () => {
      const expectedTypes = [
        "always",
        "birthday_exact_date",
        "birthday_entire_month",
        "birthday_week_before_after",
        "birthday_weekend",
        "birthday_30_days",
        "birthday_7_days_before",
        "birthday_7_days_after",
        "birthday_3_days_before",
        "birthday_3_days_after",
        "anniversary_exact_date",
        "anniversary_entire_month",
        "anniversary_week_before_after",
      ];

      expectedTypes.forEach((type) => {
        expect(VALIDITY_TYPES[type]).toBeDefined();
        expect(VALIDITY_TYPES[type].validityType).toBe(type);
        expect(VALIDITY_TYPES[type].description).toBeDefined();
        expect(VALIDITY_TYPES[type].validationLogic).toBeDefined();
        expect(VALIDITY_TYPES[type].displayText).toBeDefined();
      });
    });
  });

  describe("LEGACY_VALIDITY_TYPES", () => {
    it("should map legacy types to new types", () => {
      expect(LEGACY_VALIDITY_TYPES["birthday_date"]).toBe(
        "birthday_exact_date",
      );
      expect(LEGACY_VALIDITY_TYPES["birthday_month"]).toBe(
        "birthday_entire_month",
      );
      expect(LEGACY_VALIDITY_TYPES["birthday_week"]).toBe(
        "birthday_week_before_after",
      );
    });
  });

  describe("validateBenefitData", () => {
    it("should validate correct benefit data", () => {
      const validBenefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        validityType: "birthday_exact_date",
        validityDuration: 30,
      };

      const result = validateBenefitData(validBenefit);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject benefit data with missing required fields", () => {
      const invalidBenefit = {
        title: "",
        description: "",
        brandId: "",
        redemptionMethod: "",
        validityType: "invalid_type",
      };

      const result = validateBenefitData(invalidBenefit);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
      expect(result.errors).toContain("Description is required");
      expect(result.errors).toContain("Brand ID is required");
      expect(result.errors).toContain("Redemption method is required");
      expect(
        result.errors.some((error) =>
          error.includes("Invalid validity type: invalid_type"),
        ),
      ).toBe(true);
    });

    it("should reject invalid validity types", () => {
      const invalidBenefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        validityType: "invalid_type",
      };

      const result = validateBenefitData(invalidBenefit);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes("Invalid validity type: invalid_type"),
        ),
      ).toBe(true);
    });

    it("should accept legacy validity types", () => {
      const legacyBenefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        validityType: "birthday_date",
      };

      const result = validateBenefitData(legacyBenefit);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate validity duration type", () => {
      const invalidBenefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        validityType: "birthday_exact_date",
        validityDuration: "not_a_number" as any,
      };

      const result = validateBenefitData(invalidBenefit);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Validity duration must be a number");
    });
  });

  describe("getValidityDisplayText", () => {
    it("should return correct display text for valid types", () => {
      expect(getValidityDisplayText("birthday_exact_date", "he")).toBe(
        "תקף ביום ההולדת בלבד",
      );
      expect(getValidityDisplayText("birthday_entire_month", "he")).toBe(
        "תקף לכל החודש",
      );
      expect(getValidityDisplayText("birthday_week_before_after", "he")).toBe(
        "תקף לשבוע לפני ואחרי",
      );
    });

    it("should handle legacy types", () => {
      expect(getValidityDisplayText("birthday_date", "he")).toBe(
        "תקף ביום ההולדת בלבד",
      );
      // Unknown legacy types return the original type
      expect(getValidityDisplayText("validity1Week", "he")).toBe(
        "validity1Week",
      );
      expect(getValidityDisplayText("validity3DaysBefore", "he")).toBe(
        "3 ימים לפני",
      );
      expect(getValidityDisplayText("validity3DaysAfter", "he")).toBe(
        "3 ימים אחרי",
      );
    });

    it("should handle English translations", () => {
      expect(getValidityDisplayText("birthday_exact_date", "en")).toBe(
        "Valid only on birthday",
      );
      expect(getValidityDisplayText("birthday_entire_month", "en")).toBe(
        "Valid for entire month",
      );
    });

    it("should return fallback for unknown types", () => {
      expect(getValidityDisplayText("unknown_type", "he")).toBe("unknown_type");
      expect(getValidityDisplayText("unknown_type", "en")).toBe("unknown_type");
    });
  });

  describe("Anniversary benefit validation", () => {
    it("should handle anniversary exact date", () => {
      const benefit = { validityType: "anniversary_exact_date" };

      // Mock current date to be anniversary date
      const mockDate = new Date("2023-06-15");
      const userDOB = new Date("1990-01-01");

      expect(isBenefitActive(benefit, userDOB, mockDate)).toBe(false);
      // Anniversary benefits currently always return true for upcoming
      expect(getUpcomingBenefits(benefit, userDOB, mockDate)).toBe(true);
    });

    it("should handle anniversary entire month", () => {
      const benefit = { validityType: "anniversary_entire_month" };
      const userDOB = new Date("1990-01-01");
      const mockDate = new Date("2023-06-15");

      expect(isBenefitActive(benefit, userDOB, mockDate)).toBe(false);
      // Anniversary benefits currently always return true for upcoming
      expect(getUpcomingBenefits(benefit, userDOB, mockDate)).toBe(true);
    });

    it("should handle anniversary week before and after", () => {
      const benefit = { validityType: "anniversary_week_before_after" };
      const userDOB = new Date("1990-01-01");
      const mockDate = new Date("2023-06-15");

      expect(isBenefitActive(benefit, userDOB, mockDate)).toBe(false);
      // Anniversary benefits currently always return true for upcoming
      expect(getUpcomingBenefits(benefit, userDOB, mockDate)).toBe(true);
    });
  });

  describe("isBenefitActive", () => {
    const userDOB = new Date("1990-06-15"); // June 15th

    it("should return false when user has no DOB", () => {
      const benefit = { validityType: "birthday_exact_date" };
      const result = isBenefitActive(benefit, null);
      expect(result).toBe(false);
    });

    it("should validate birthday_exact_date correctly", () => {
      const benefit = { validityType: "birthday_exact_date" };

      // On birthday
      const birthdayDate = new Date("2024-06-15");
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

      // Day before birthday
      const dayBefore = new Date("2024-06-14");
      expect(isBenefitActive(benefit, userDOB, dayBefore)).toBe(false);

      // Day after birthday
      const dayAfter = new Date("2024-06-16");
      expect(isBenefitActive(benefit, userDOB, dayAfter)).toBe(false);
    });

    it("should validate birthday_entire_month correctly", () => {
      const benefit = { validityType: "birthday_entire_month" };

      // In birthday month
      const inBirthdayMonth = new Date("2024-06-20");
      expect(isBenefitActive(benefit, userDOB, inBirthdayMonth)).toBe(true);

      // Different month
      const differentMonth = new Date("2024-07-15");
      expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
    });

    it("should validate birthday_week_before_after correctly", () => {
      const benefit = { validityType: "birthday_week_before_after" };

      // On birthday
      const birthdayDate = new Date("2024-06-15");
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

      // 7 days before
      const weekBefore = new Date("2024-06-08");
      expect(isBenefitActive(benefit, userDOB, weekBefore)).toBe(true);

      // 7 days after
      const weekAfter = new Date("2024-06-22");
      expect(isBenefitActive(benefit, userDOB, weekAfter)).toBe(true);

      // 8 days before (should be false)
      const tooEarly = new Date("2024-06-07");
      expect(isBenefitActive(benefit, userDOB, tooEarly)).toBe(false);

      // 8 days after (should be false)
      const tooLate = new Date("2024-06-23");
      expect(isBenefitActive(benefit, userDOB, tooLate)).toBe(false);
    });

    it("should handle legacy types", () => {
      const benefit = { validityType: "birthday_date" };
      const birthdayDate = new Date("2024-06-15");
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);
    });

    it("should return false for unknown types", () => {
      const benefit = { validityType: "unknown_type" };
      const birthdayDate = new Date("2024-06-15");
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(false);
    });
  });

  describe("always validity type", () => {
    it("should always return true for always validity type", () => {
      const benefit = { validityType: "always" };
      const userDOB = new Date("1990-06-15");

      // Should be active regardless of date
      const anyDate = new Date("2024-01-01");
      expect(isBenefitActive(benefit, userDOB, anyDate)).toBe(true);

      const anotherDate = new Date("2024-12-31");
      expect(isBenefitActive(benefit, userDOB, anotherDate)).toBe(true);

      // Should work with any valid date when user has DOB
      const birthdayDate = new Date("2024-06-15");
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);
    });
  });

  describe("getUpcomingBenefits", () => {
    const userDOB = new Date("1990-06-15"); // June 15th

    it("should return false when user has no DOB", () => {
      const benefit = { validityType: "birthday_exact_date" };
      const result = getUpcomingBenefits(benefit, null);
      expect(result).toBe(false);
    });

    it("should validate birthday_exact_date upcoming correctly", () => {
      const benefit = { validityType: "birthday_exact_date" };

      // More than 7 days before birthday
      const farBefore = new Date("2024-06-07");
      expect(getUpcomingBenefits(benefit, userDOB, farBefore)).toBe(true);

      // Within 7 days of birthday
      const nearBirthday = new Date("2024-06-10");
      expect(getUpcomingBenefits(benefit, userDOB, nearBirthday)).toBe(true);

      // Different month
      const differentMonth = new Date("2024-07-15");
      expect(getUpcomingBenefits(benefit, userDOB, differentMonth)).toBe(true);
    });

    it("should validate birthday_entire_month upcoming correctly", () => {
      const benefit = { validityType: "birthday_entire_month" };

      // Different month
      const differentMonth = new Date("2024-07-15");
      expect(getUpcomingBenefits(benefit, userDOB, differentMonth)).toBe(true);

      // Same month
      const sameMonth = new Date("2024-06-20");
      expect(getUpcomingBenefits(benefit, userDOB, sameMonth)).toBe(false);
    });

    it("should return false for unknown types", () => {
      const benefit = { validityType: "unknown_type" };
      const testDate = new Date("2024-06-15");
      expect(getUpcomingBenefits(benefit, userDOB, testDate)).toBe(false);
    });
  });

  describe("Additional birthday validation types", () => {
    const userDOB = new Date("1990-06-15"); // June 15th

    describe("birthday_weekend", () => {
      it("should validate birthday weekend correctly", () => {
        const benefit = { validityType: "birthday_weekend" };

        // On birthday
        const birthdayDate = new Date("2024-06-15");
        expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

        // 2 days before
        const twoDaysBefore = new Date("2024-06-13");
        expect(isBenefitActive(benefit, userDOB, twoDaysBefore)).toBe(true);

        // 2 days after
        const twoDaysAfter = new Date("2024-06-17");
        expect(isBenefitActive(benefit, userDOB, twoDaysAfter)).toBe(true);

        // 3 days before (should be true within 6-day window)
        const threeDaysBefore = new Date("2024-06-12");
        expect(isBenefitActive(benefit, userDOB, threeDaysBefore)).toBe(true);

        // 3 days after (should be true within 6-day window)
        const threeDaysAfter = new Date("2024-06-18");
        expect(isBenefitActive(benefit, userDOB, threeDaysAfter)).toBe(true);

        // Different month
        const differentMonth = new Date("2024-07-15");
        expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
      });
    });

    describe("birthday_30_days", () => {
      it("should validate 30 days period correctly", () => {
        const benefit = { validityType: "birthday_30_days" };

        // On birthday
        const birthdayDate = new Date("2024-06-15");
        expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

        // 30 days before
        const thirtyDaysBefore = new Date("2024-05-16");
        expect(isBenefitActive(benefit, userDOB, thirtyDaysBefore)).toBe(false); // Different month

        // Within same month, 14 days before
        const fourteenDaysBefore = new Date("2024-06-01");
        expect(isBenefitActive(benefit, userDOB, fourteenDaysBefore)).toBe(
          true,
        );

        // Different month
        const differentMonth = new Date("2024-07-15");
        expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
      });
    });

    describe("birthday_7_days_before", () => {
      it("should validate 7 days before correctly", () => {
        const benefit = { validityType: "birthday_7_days_before" };

        // On birthday
        const birthdayDate = new Date("2024-06-15");
        expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

        // 7 days before
        const sevenDaysBefore = new Date("2024-06-08");
        expect(isBenefitActive(benefit, userDOB, sevenDaysBefore)).toBe(true);

        // 1 day after birthday (should be false)
        const dayAfter = new Date("2024-06-16");
        expect(isBenefitActive(benefit, userDOB, dayAfter)).toBe(false);

        // 8 days before (should be false)
        const eightDaysBefore = new Date("2024-06-07");
        expect(isBenefitActive(benefit, userDOB, eightDaysBefore)).toBe(false);

        // Different month
        const differentMonth = new Date("2024-07-15");
        expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
      });
    });

    describe("birthday_7_days_after", () => {
      it("should validate 7 days after correctly", () => {
        const benefit = { validityType: "birthday_7_days_after" };

        // On birthday
        const birthdayDate = new Date("2024-06-15");
        expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

        // 7 days after
        const sevenDaysAfter = new Date("2024-06-22");
        expect(isBenefitActive(benefit, userDOB, sevenDaysAfter)).toBe(true);

        // 1 day before birthday (should be false)
        const dayBefore = new Date("2024-06-14");
        expect(isBenefitActive(benefit, userDOB, dayBefore)).toBe(false);

        // 8 days after (should be false)
        const eightDaysAfter = new Date("2024-06-23");
        expect(isBenefitActive(benefit, userDOB, eightDaysAfter)).toBe(false);

        // Different month
        const differentMonth = new Date("2024-07-15");
        expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
      });
    });

    describe("birthday_3_days_before", () => {
      it("should validate 3 days before correctly", () => {
        const benefit = { validityType: "birthday_3_days_before" };

        // On birthday
        const birthdayDate = new Date("2024-06-15");
        expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

        // 3 days before
        const threeDaysBefore = new Date("2024-06-12");
        expect(isBenefitActive(benefit, userDOB, threeDaysBefore)).toBe(true);

        // 1 day after birthday (should be false)
        const dayAfter = new Date("2024-06-16");
        expect(isBenefitActive(benefit, userDOB, dayAfter)).toBe(false);

        // 4 days before (should be false)
        const fourDaysBefore = new Date("2024-06-11");
        expect(isBenefitActive(benefit, userDOB, fourDaysBefore)).toBe(false);

        // Different month
        const differentMonth = new Date("2024-07-15");
        expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
      });
    });

    describe("birthday_3_days_after", () => {
      it("should validate 3 days after correctly", () => {
        const benefit = { validityType: "birthday_3_days_after" };

        // On birthday
        const birthdayDate = new Date("2024-06-15");
        expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true);

        // 3 days after
        const threeDaysAfter = new Date("2024-06-18");
        expect(isBenefitActive(benefit, userDOB, threeDaysAfter)).toBe(true);

        // 1 day before birthday (should be false)
        const dayBefore = new Date("2024-06-14");
        expect(isBenefitActive(benefit, userDOB, dayBefore)).toBe(false);

        // 4 days after (should be false)
        const fourDaysAfter = new Date("2024-06-19");
        expect(isBenefitActive(benefit, userDOB, fourDaysAfter)).toBe(false);

        // Different month
        const differentMonth = new Date("2024-07-15");
        expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false);
      });
    });
  });

  describe("Edge cases and validation", () => {
    it("should handle empty benefit data", () => {
      const result = validateBenefitData({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
      expect(result.errors).toContain("Description is required");
      expect(result.errors).toContain("Brand ID is required");
      expect(result.errors).toContain("Redemption method is required");
      expect(result.errors).toContain("Validity type is required");
    });

    it("should handle benefit data with undefined fields", () => {
      const result = validateBenefitData({
        title: undefined,
        description: undefined,
        brandId: undefined,
        redemptionMethod: undefined,
        validityType: undefined,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
    });

    it("should accept valid validity duration as number", () => {
      const validBenefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        validityType: "birthday_exact_date",
        validityDuration: 30,
      };

      const result = validateBenefitData(validBenefit);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid validity duration types", () => {
      const invalidTypes = ["string", [], {}, true];

      invalidTypes.forEach((invalidDuration) => {
        const invalidBenefit = {
          title: "Test Benefit",
          description: "Test Description",
          brandId: "brand-1",
          redemptionMethod: "code",
          validityType: "birthday_exact_date",
          validityDuration: invalidDuration as any,
        };

        const result = validateBenefitData(invalidBenefit);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Validity duration must be a number");
      });
    });

    it("should accept falsy validity duration values", () => {
      const falsyValues = [false, 0, "", null, undefined];

      falsyValues.forEach((falsyValue) => {
        const benefit = {
          title: "Test Benefit",
          description: "Test Description",
          brandId: "brand-1",
          redemptionMethod: "code",
          validityType: "birthday_exact_date",
          validityDuration: falsyValue as any,
        };

        const result = validateBenefitData(benefit);
        // Should not complain about validity duration for falsy values
        const hasValidityDurationError = result.errors.some((error) =>
          error.includes("Validity duration must be a number"),
        );
        expect(hasValidityDurationError).toBe(false);
      });
    });

    it("should accept undefined validity duration", () => {
      const validBenefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        validityType: "birthday_exact_date",
        // validityDuration is undefined (not provided)
      };

      const result = validateBenefitData(validBenefit);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle all legacy validity type mappings", () => {
      const legacyMappings = [
        "validityExactDate",
        "validityEntireMonth",
        "validityWeekBeforeAfter",
        "validityWeekend",
        "validity30Days",
        "validity7DaysBefore",
        "validity7DaysAfter",
        "validity3DaysBefore",
        "validity3DaysAfter",
      ];

      legacyMappings.forEach((legacyType) => {
        const benefit = {
          title: "Test Benefit",
          description: "Test Description",
          brandId: "brand-1",
          redemptionMethod: "code",
          validityType: legacyType,
        };

        const result = validateBenefitData(benefit);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should return fallback display text for unmapped legacy types", () => {
      // Test a legacy type that doesn't exist in LEGACY_VALIDITY_TYPES
      expect(getValidityDisplayText("nonexistent_legacy_type", "he")).toBe(
        "nonexistent_legacy_type",
      );
      expect(getValidityDisplayText("nonexistent_legacy_type", "en")).toBe(
        "nonexistent_legacy_type",
      );
    });

    it("should handle missing validity type in benefit data", () => {
      const benefit = {
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand-1",
        redemptionMethod: "code",
        // Missing validityType
      };

      const result = validateBenefitData(benefit);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Validity type is required");
    });
  });

  describe("ALL_VALIDITY_TYPES", () => {
    it("should contain all validity types", () => {
      expect(ALL_VALIDITY_TYPES).toContain("birthday_exact_date");
      expect(ALL_VALIDITY_TYPES).toContain("birthday_entire_month");
      expect(ALL_VALIDITY_TYPES).toContain("birthday_week_before_after");
      expect(ALL_VALIDITY_TYPES).toContain("always");
      expect(ALL_VALIDITY_TYPES).toContain("anniversary_exact_date");
    });

    it("should have the same length as VALIDITY_TYPES keys", () => {
      expect(ALL_VALIDITY_TYPES).toHaveLength(
        Object.keys(VALIDITY_TYPES).length,
      );
    });
  });
});
