import {
  isBenefitActive,
  getUpcomingBenefits,
  getValidityDisplayText,
  VALIDITY_TYPES,
} from "@/lib/benefit-validation";

describe("Benefit Validation Edge Cases", () => {
  describe("Birthday validation edge cases", () => {
    it("should handle leap year birthdays correctly", () => {
      // User born on leap day (Feb 29, 1992)
      const leapYearDOB = new Date("1992-02-29");

      // Test on Feb 28 in non-leap year (2023)
      const feb28NonLeap = new Date("2023-02-28");
      expect(
        isBenefitActive("birthday_exact_date", leapYearDOB, feb28NonLeap),
      ).toBe(false);

      // Test on Feb 29 in leap year (2024)
      const feb29Leap = new Date("2024-02-29");
      expect(
        isBenefitActive("birthday_exact_date", leapYearDOB, feb29Leap),
      ).toBe(true);

      // Test month validation for leap year DOB
      expect(
        isBenefitActive("birthday_entire_month", leapYearDOB, feb28NonLeap),
      ).toBe(true);
    });

    it("should handle year-end/year-start birthday weeks correctly", () => {
      // User born on January 3rd
      const jan3DOB = new Date("1990-01-03");

      // Test December 27 (week before birthday, crossing year boundary)
      const dec27 = new Date("2023-12-27");
      expect(
        isBenefitActive("birthday_week_before_after", jan3DOB, dec27),
      ).toBe(false);

      // Test January 10 (week after birthday)
      const jan10 = new Date("2024-01-10");
      expect(
        isBenefitActive("birthday_week_before_after", jan3DOB, jan10),
      ).toBe(true);
    });

    it("should handle December 31st birthdays", () => {
      const dec31DOB = new Date("1990-12-31");

      // Test on December 31st
      const dec31 = new Date("2023-12-31");
      expect(isBenefitActive("birthday_exact_date", dec31DOB, dec31)).toBe(
        true,
      );

      // Test week validation around year boundary
      const dec24 = new Date("2023-12-24");
      expect(
        isBenefitActive("birthday_week_before_after", dec31DOB, dec24),
      ).toBe(true);

      // Test January 7th of next year (should not be valid)
      const jan7 = new Date("2024-01-07");
      expect(
        isBenefitActive("birthday_week_before_after", dec31DOB, jan7),
      ).toBe(false);
    });

    it("should handle weekend calculation for various days", () => {
      const tuesdayDOB = new Date("1990-01-02"); // January 2, 1990 was a Tuesday

      // Test Friday before (should be valid)
      const friday = new Date("2024-01-05"); // If Jan 2 is Tuesday, Jan 5 is Friday
      expect(isBenefitActive("birthday_weekend", tuesdayDOB, friday)).toBe(
        true,
      );

      // Test Monday after (should be valid)
      const monday = new Date("2024-01-08"); // Monday after the weekend
      expect(isBenefitActive("birthday_weekend", tuesdayDOB, monday)).toBe(
        true,
      );

      // Test Tuesday itself (should be valid)
      const tuesday = new Date("2024-01-02");
      expect(isBenefitActive("birthday_weekend", tuesdayDOB, tuesday)).toBe(
        true,
      );
    });
  });

  describe("Anniversary validation edge cases", () => {
    it("should handle anniversary dates that don't exist in current year", () => {
      // Anniversary on Feb 29 (leap day)
      const leapAnniversary = new Date("2020-02-29");

      // Test in non-leap year
      const feb28NonLeap = new Date("2023-02-28");
      expect(
        isBenefitActive(
          "anniversary_exact_date",
          leapAnniversary,
          feb28NonLeap,
        ),
      ).toBe(false);

      // Test Feb 29 in leap year
      const feb29Leap = new Date("2024-02-29");
      expect(
        isBenefitActive("anniversary_exact_date", leapAnniversary, feb29Leap),
      ).toBe(true);
    });

    it("should validate anniversary month correctly", () => {
      const juneAnniversary = new Date("2019-06-15");

      // Test same month
      const june1 = new Date("2023-06-01");
      expect(
        isBenefitActive("anniversary_entire_month", juneAnniversary, june1),
      ).toBe(true);

      // Test different month
      const july1 = new Date("2023-07-01");
      expect(
        isBenefitActive("anniversary_entire_month", juneAnniversary, july1),
      ).toBe(false);
    });
  });

  describe("Upcoming benefits calculation", () => {
    it("should calculate upcoming benefits correctly for various validity types", () => {
      const benefits = [
        {
          id: "1",
          validityType: "birthday_exact_date",
          title: "Birthday Special",
        },
        {
          id: "2",
          validityType: "birthday_entire_month",
          title: "Month Special",
        },
        {
          id: "3",
          validityType: "always",
          title: "Always Available",
        },
      ];

      const userDOB = new Date("1990-06-15");
      const currentDate = new Date("2023-05-20"); // May 20, so June birthday is upcoming

      const upcoming = getUpcomingBenefits(benefits, userDOB, currentDate);

      // Should include birthday benefits but not always-available ones
      expect(upcoming.length).toBeGreaterThan(0);
      expect(upcoming.some((b) => b.id === "1")).toBe(true);
      expect(upcoming.some((b) => b.id === "2")).toBe(true);
      expect(upcoming.some((b) => b.id === "3")).toBe(false); // Always available shouldn't be "upcoming"
    });

    it("should handle benefits that are currently active", () => {
      const benefits = [
        {
          id: "1",
          validityType: "birthday_exact_date",
          title: "Today's Special",
        },
      ];

      const userDOB = new Date("1990-06-15");
      const currentDate = new Date("2023-06-15"); // Birthday today

      const upcoming = getUpcomingBenefits(benefits, userDOB, currentDate);

      // Currently active benefits shouldn't be in upcoming
      expect(upcoming.some((b) => b.id === "1")).toBe(false);
    });
  });

  describe("Validity display text", () => {
    it("should return correct display text for all validity types", () => {
      Object.keys(VALIDITY_TYPES).forEach((validityType) => {
        const displayText = getValidityDisplayText(validityType);
        expect(displayText).toBeDefined();
        expect(typeof displayText).toBe("string");
        expect(displayText.length).toBeGreaterThan(0);
      });
    });

    it("should handle unknown validity types gracefully", () => {
      const displayText = getValidityDisplayText("unknown_type");
      expect(displayText).toBe("unknown_type");
    });

    it("should handle null and undefined validity types", () => {
      expect(getValidityDisplayText(null as any)).toBe("null");
      expect(getValidityDisplayText(undefined as any)).toBe("undefined");
    });
  });

  describe("Legacy validity type support", () => {
    it("should handle legacy validity type names", () => {
      // Test common legacy names that might exist in old data
      const legacyTypes = [
        "birthdayExactDate",
        "birthdayEntireMonth",
        "weekBeforeAfter",
        "validityEntireMonth",
      ];

      legacyTypes.forEach((legacyType) => {
        // Should not crash when encountering legacy types
        expect(() => {
          isBenefitActive(
            legacyType,
            new Date("1990-06-15"),
            new Date("2023-06-15"),
          );
        }).not.toThrow();

        expect(() => {
          getValidityDisplayText(legacyType);
        }).not.toThrow();
      });
    });
  });

  describe("Date edge cases", () => {
    it("should handle invalid dates gracefully", () => {
      const invalidDate = new Date("invalid");
      const validDate = new Date("2023-06-15");

      expect(() => {
        isBenefitActive("birthday_exact_date", invalidDate, validDate);
      }).not.toThrow();

      expect(() => {
        isBenefitActive("birthday_exact_date", validDate, invalidDate);
      }).not.toThrow();
    });

    it("should handle very old and future dates", () => {
      const veryOldDOB = new Date("1900-01-01");
      const futureDate = new Date("2100-01-01");
      const currentDate = new Date("2023-06-15");

      // Should work with very old DOB
      expect(() => {
        isBenefitActive("birthday_exact_date", veryOldDOB, currentDate);
      }).not.toThrow();

      // Should work with future dates
      expect(() => {
        isBenefitActive("birthday_exact_date", veryOldDOB, futureDate);
      }).not.toThrow();
    });

    it.skip("should handle timezone edge cases", () => {
      // Dates at different timezones but same calendar day
      const dob = new Date("1990-06-15T00:00:00Z");
      const sameDay = new Date("2024-06-15T23:59:59Z"); // Same month/day, different year

      expect(isBenefitActive("birthday_exact_date", dob, sameDay)).toBe(true);
    });
  });
});
