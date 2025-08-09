// Benefit validation system to ensure all benefits follow the specification

export interface BenefitValidationRule {
  validityType: string;
  description: string;
  validationLogic: (userDOB: Date, currentDate: Date) => boolean;
  displayText: string;
}

export const VALIDITY_TYPES: Record<string, BenefitValidationRule> = {
  // Birthday benefits
  "birthday_exact_date": {
    validityType: "birthday_exact_date",
    description: "Only valid on the exact birthday date",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      return userDOB.getMonth() === currentDate.getMonth() && 
             userDOB.getDate() === currentDate.getDate();
    },
    displayText: "תקף ביום ההולדת בלבד"
  },
  
  "birthday_entire_month": {
    validityType: "birthday_entire_month",
    description: "Valid for the entire birthday month",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      return userDOB.getMonth() === currentDate.getMonth();
    },
    displayText: "תקף לכל החודש"
  },
  
  "birthday_week_before_after": {
    validityType: "birthday_week_before_after",
    description: "Valid for a week before and after the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= -7 && daysUntilBirthday <= 7;
      }
      return false;
    },
    displayText: "תקף לשבוע לפני ואחרי"
  },
  
  "birthday_weekend": {
    validityType: "birthday_weekend",
    description: "Valid for the weekend of the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= -2 && daysUntilBirthday <= 2;
      }
      return false;
    },
    displayText: "תקף בסופ״ש יום ההולדת"
  },
  
  "birthday_30_days": {
    validityType: "birthday_30_days",
    description: "Valid for 30 days from the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= -30 && daysUntilBirthday <= 30;
      }
      return false;
    },
    displayText: "תקף 30 ימים"
  },
  
  "birthday_7_days_before": {
    validityType: "birthday_7_days_before",
    description: "Valid for 7 days before the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
      }
      return false;
    },
    displayText: "תקף 7 ימים לפני"
  },
  
  "birthday_7_days_after": {
    validityType: "birthday_7_days_after",
    description: "Valid for 7 days after the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= -7 && daysUntilBirthday <= 0;
      }
      return false;
    },
    displayText: "תקף 7 ימים אחרי"
  },
  
  "birthday_3_days_before": {
    validityType: "birthday_3_days_before",
    description: "Valid for 3 days before the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= 0 && daysUntilBirthday <= 3;
      }
      return false;
    },
    displayText: "תקף 3 ימים לפני"
  },
  
  "birthday_3_days_after": {
    validityType: "birthday_3_days_after",
    description: "Valid for 3 days after the birthday",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday >= -3 && daysUntilBirthday <= 0;
      }
      return false;
    },
    displayText: "תקף 3 ימים אחרי"
  },
  
  // Anniversary benefits (for future use)
  "anniversary_exact_date": {
    validityType: "anniversary_exact_date",
    description: "Only valid on the exact anniversary date",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      // This would need anniversaryDate from user profile
      // For now, return false as anniversaryDate is not implemented
      return false;
    },
    displayText: "תקף ביום ההולדת בלבד"
  },
  
  "anniversary_entire_month": {
    validityType: "anniversary_entire_month",
    description: "Valid for the entire anniversary month",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      // This would need anniversaryDate from user profile
      return false;
    },
    displayText: "תקף לכל החודש"
  },
  
  "anniversary_week_before_after": {
    validityType: "anniversary_week_before_after",
    description: "Valid for a week before and after the anniversary",
    validationLogic: (userDOB: Date, currentDate: Date) => {
      // This would need anniversaryDate from user profile
      return false;
    },
    displayText: "תקף לשבוע לפני ואחרי"
  }
};

// Legacy types for backward compatibility
export const LEGACY_VALIDITY_TYPES: Record<string, string> = {
  "birthday_date": "birthday_exact_date",
  "birthday_month": "birthday_entire_month",
  "birthday_week": "birthday_week_before_after",
  // UI/test-friendly keys
  "validityExactDate": "birthday_exact_date",
  "validityEntireMonth": "birthday_entire_month",
  "validityWeekBeforeAfter": "birthday_week_before_after",
  "validityWeekend": "birthday_weekend",
  "validity30Days": "birthday_30_days",
  "validity7DaysBefore": "birthday_7_days_before",
  "validity7DaysAfter": "birthday_7_days_after",
  "validity3DaysBefore": "birthday_3_days_before",
  "validity3DaysAfter": "birthday_3_days_after"
};

export function validateBenefitData(benefitData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!benefitData.title) errors.push("Title is required");
  if (!benefitData.description) errors.push("Description is required");
  if (!benefitData.brandId) errors.push("Brand ID is required");
  if (!benefitData.redemptionMethod) errors.push("Redemption method is required");
  
  // Validity type validation
  if (!benefitData.validityType) {
    errors.push("Validity type is required");
  } else {
    const normalizedType = LEGACY_VALIDITY_TYPES[benefitData.validityType] || benefitData.validityType;
    if (!VALIDITY_TYPES[normalizedType]) {
      errors.push(`Invalid validity type: ${benefitData.validityType}. Valid types are: ${Object.keys(VALIDITY_TYPES).join(", ")}`);
    }
  }
  
  // Validity duration validation
  if (benefitData.validityDuration && typeof benefitData.validityDuration !== 'number') {
    errors.push("Validity duration must be a number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getValidityDisplayText(validityType: string): string {
  const normalizedType = LEGACY_VALIDITY_TYPES[validityType] || validityType;
  return VALIDITY_TYPES[normalizedType]?.displayText || "תקף לתקופה מוגבלת";
}

export function isBenefitActive(benefit: any, userDOB: Date | null, currentDate: Date = new Date()): boolean {
  if (!userDOB) return false;
  
  const normalizedType = LEGACY_VALIDITY_TYPES[benefit.validityType] || benefit.validityType;
  const validationRule = VALIDITY_TYPES[normalizedType];
  
  if (!validationRule) {
    console.warn(`Unknown validity type: ${benefit.validityType}`);
    return false;
  }
  
  return validationRule.validationLogic(userDOB, currentDate);
}

export function getUpcomingBenefits(benefit: any, userDOB: Date | null, currentDate: Date = new Date()): boolean {
  if (!userDOB) return false;
  
  const normalizedType = LEGACY_VALIDITY_TYPES[benefit.validityType] || benefit.validityType;
  
  switch (normalizedType) {
    case "birthday_exact_date":
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        return daysUntilBirthday > 7;
      }
      return birthdayMonth !== currentMonth;
      
    case "birthday_entire_month":
      return userDOB.getMonth() !== currentDate.getMonth();
      
    default:
      return false;
  }
}

// Export all validity types for reference
export const ALL_VALIDITY_TYPES = Object.keys(VALIDITY_TYPES); 