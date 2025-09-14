// Benefit validation system to ensure all benefits follow the specification
import { translations, Language } from './translations';

export interface BenefitValidationRule {
  validityType: string;
  description: string;
  validationLogic: (userDOB: Date, currentDate: Date) => boolean;
  displayText: string;
}

export const VALIDITY_TYPES: Record<string, BenefitValidationRule> = {
  // Always valid (year-round)
  always: {
    validityType: 'always',
    description: 'Valid anytime (year-round)',
    validationLogic: () => true,
    displayText: 'validForLimitedPeriod',
  },
  // Birthday benefits
  birthday_exact_date: {
    validityType: 'birthday_exact_date',
    description: 'Only valid on the exact birthday date',
    validationLogic: (userDOB: Date, currentDate: Date) => {
      return (
        userDOB.getMonth() === currentDate.getMonth() &&
        userDOB.getDate() === currentDate.getDate()
      );
    },
    displayText: 'validOnlyOnBirthday',
  },

  birthday_entire_month: {
    validityType: 'birthday_entire_month',
    description: 'Valid for the entire birthday month',
    validationLogic: (userDOB: Date, currentDate: Date) => {
      return userDOB.getMonth() === currentDate.getMonth();
    },
    displayText: 'validForEntireMonth',
  },

  birthday_week_before_after: {
    validityType: 'birthday_week_before_after',
    description: 'Valid for a week before and after the birthday',
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
    displayText: 'validForWeek',
  },

  birthday_weekend: {
    validityType: 'birthday_weekend',
    description: 'Valid for the weekend of the birthday',
    validationLogic: (userDOB: Date, currentDate: Date) => {
      const birthdayMonth = userDOB.getMonth();
      const birthdayDay = userDOB.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();

      if (birthdayMonth === currentMonth) {
        const daysUntilBirthday = birthdayDay - currentDay;
        // Allow Friday before to Monday after (6 day window)
        return daysUntilBirthday >= -6 && daysUntilBirthday <= 6;
      }
      return false;
    },
    displayText: 'validityWeekend',
  },

  birthday_30_days: {
    validityType: 'birthday_30_days',
    description: 'Valid for 30 days from the birthday',
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
    displayText: 'validity30Days',
  },

  birthday_7_days_before: {
    validityType: 'birthday_7_days_before',
    description: 'Valid for 7 days before the birthday',
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
    displayText: 'validity7DaysBefore',
  },

  birthday_7_days_after: {
    validityType: 'birthday_7_days_after',
    description: 'Valid for 7 days after the birthday',
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
    displayText: 'validity7DaysAfter',
  },

  birthday_3_days_before: {
    validityType: 'birthday_3_days_before',
    description: 'Valid for 3 days before the birthday',
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
    displayText: 'validity3DaysBefore',
  },

  birthday_3_days_after: {
    validityType: 'birthday_3_days_after',
    description: 'Valid for 3 days after the birthday',
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
    displayText: 'validity3DaysAfter',
  },

  // Anniversary benefits (for testing purposes, uses userDOB as anniversary date)
  anniversary_exact_date: {
    validityType: 'anniversary_exact_date',
    description: 'Only valid on the exact anniversary date',
    validationLogic: (userDOB: Date, currentDate: Date) => {
      // For testing, treat userDOB as anniversary date
      return (
        userDOB.getMonth() === currentDate.getMonth() &&
        userDOB.getDate() === currentDate.getDate()
      );
    },
    displayText: 'validOnlyOnBirthday',
  },

  anniversary_entire_month: {
    validityType: 'anniversary_entire_month',
    description: 'Valid for the entire anniversary month',
    validationLogic: (userDOB: Date, currentDate: Date) => {
      // For testing, treat userDOB as anniversary date
      return userDOB.getMonth() === currentDate.getMonth();
    },
    displayText: 'validForEntireMonth',
  },

  anniversary_week_before_after: {
    validityType: 'anniversary_week_before_after',
    description: 'Valid for a week before and after the anniversary',
    validationLogic: (userDOB: Date, currentDate: Date) => {
      // This would need anniversaryDate from user profile
      return false;
    },
    displayText: 'validForWeek',
  },
};

// Legacy types for backward compatibility
export const LEGACY_VALIDITY_TYPES: Record<string, string> = {
  birthday_date: 'birthday_exact_date',
  birthday_month: 'birthday_entire_month',
  birthday_week: 'birthday_week_before_after',
  // UI/test-friendly keys
  validityExactDate: 'birthday_exact_date',
  validityEntireMonth: 'birthday_entire_month',
  validityWeekBeforeAfter: 'birthday_week_before_after',
  validityWeekend: 'birthday_weekend',
  validity30Days: 'birthday_30_days',
  validity7DaysBefore: 'birthday_7_days_before',
  validity7DaysAfter: 'birthday_7_days_after',
  validity3DaysBefore: 'birthday_3_days_before',
  validity3DaysAfter: 'birthday_3_days_after',
};

export function validateBenefitData(benefitData: {
  title?: string;
  description?: string;
  brandId?: string;
  validityType?: string;
  validityDuration?: number;
  redemptionMethod?: string;
  termsAndConditions?: string;
  [key: string]: unknown;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!benefitData.title) errors.push('Title is required');
  if (!benefitData.description) errors.push('Description is required');
  if (!benefitData.brandId) errors.push('Brand ID is required');
  if (!benefitData.redemptionMethod)
    errors.push('Redemption method is required');

  // Validity type validation
  if (!benefitData.validityType) {
    errors.push('Validity type is required');
  } else {
    const normalizedType =
      LEGACY_VALIDITY_TYPES[benefitData.validityType] ||
      benefitData.validityType;
    if (!VALIDITY_TYPES[normalizedType]) {
      errors.push(
        `Invalid validity type: ${
          benefitData.validityType
        }. Valid types are: ${Object.keys(VALIDITY_TYPES).join(', ')}`
      );
    }
  }

  // Validity duration validation
  if (
    benefitData.validityDuration &&
    typeof benefitData.validityDuration !== 'number'
  ) {
    errors.push('Validity duration must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getValidityDisplayText(
  validityType: string,
  language: Language = 'he'
): string {
  // Handle null and undefined cases
  if (validityType == null) {
    return String(validityType);
  }

  const normalizedType = LEGACY_VALIDITY_TYPES[validityType] || validityType;

  // If the type is unknown, return the original type
  if (!VALIDITY_TYPES[normalizedType]) {
    return validityType;
  }

  const keyOrText =
    VALIDITY_TYPES[normalizedType]?.displayText || 'validForLimitedPeriod';
  const translationMap = translations[language] as unknown as Record<
    string,
    string
  >;
  return translationMap[keyOrText] || keyOrText;
}

// Overload for single benefit (used by dashboard)
export function getUpcomingBenefits(
  benefit: { id?: string; validityType: string; [key: string]: any },
  userDOB: Date | null,
  currentDate?: Date
): boolean;
// Overload for array of benefits (used by tests)
export function getUpcomingBenefits(
  benefits: Array<{ id?: string; validityType: string; [key: string]: any }>,
  userDOB: Date | null,
  currentDate?: Date
): Array<{ id?: string; validityType: string; [key: string]: any }>;
export function getUpcomingBenefits(
  benefitOrBenefits:
    | { id?: string; validityType: string; [key: string]: any }
    | Array<{ id?: string; validityType: string; [key: string]: any }>,
  userDOB: Date | null,
  currentDate: Date = new Date()
): boolean | Array<{ id?: string; validityType: string; [key: string]: any }> {
  if (!userDOB) return Array.isArray(benefitOrBenefits) ? [] : false;

  // Helper function to check if a benefit is upcoming
  const isBenefitUpcoming = (benefit: {
    id?: string;
    validityType: string;
    [key: string]: any;
  }): boolean => {
    const normalizedType =
      LEGACY_VALIDITY_TYPES[benefit.validityType] || benefit.validityType;

    // Skip always available benefits - they're not "upcoming"
    if (normalizedType === 'always') return false;

    // Skip currently active benefits
    if (isBenefitActive(benefit, userDOB, currentDate)) return false;

    switch (normalizedType) {
      case 'birthday_exact_date':
      case 'birthday_entire_month':
      case 'birthday_week_before_after':
      case 'birthday_weekend':
      case 'birthday_30_days':
      case 'birthday_7_days_before':
      case 'birthday_7_days_after':
      case 'birthday_3_days_before':
      case 'birthday_3_days_after':
        const birthdayMonth = userDOB.getMonth();
        const currentMonth = currentDate.getMonth();

        // Birthday is upcoming if it's in a future month this year or next year
        if (birthdayMonth > currentMonth) return true;
        if (birthdayMonth < currentMonth) return true; // Next year

        // Same month - check if birthday hasn't passed yet
        const birthdayDay = userDOB.getDate();
        const currentDay = currentDate.getDate();
        return birthdayDay > currentDay;

      case 'anniversary_exact_date':
      case 'anniversary_entire_month':
      case 'anniversary_week_before_after':
        // For now, treat same as birthday
        return true;

      default:
        return false;
    }
  };

  if (Array.isArray(benefitOrBenefits)) {
    return benefitOrBenefits.filter(isBenefitUpcoming);
  } else {
    return isBenefitUpcoming(benefitOrBenefits);
  }
}

// Overload for backward compatibility with tests that pass validityType as string
export function isBenefitActive(
  validityType: string,
  userDOB: Date | null,
  currentDate?: Date
): boolean;
export function isBenefitActive(
  benefit: { validityType: string },
  userDOB: Date | null,
  currentDate?: Date
): boolean;
export function isBenefitActive(
  benefitOrValidityType: string | { validityType: string },
  userDOB: Date | null,
  currentDate: Date = new Date()
): boolean {
  if (!userDOB) return false;

  const validityType =
    typeof benefitOrValidityType === 'string'
      ? benefitOrValidityType
      : benefitOrValidityType.validityType;

  const normalizedType = LEGACY_VALIDITY_TYPES[validityType] || validityType;
  const validationRule = VALIDITY_TYPES[normalizedType];

  if (!validationRule) {
    console.warn(`Unknown validity type: ${validityType}`);
    return false;
  }

  return validationRule.validationLogic(userDOB, currentDate);
}

// Export all validity types for reference
export const ALL_VALIDITY_TYPES = Object.keys(VALIDITY_TYPES);
