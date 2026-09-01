# Benefits Specification

This document outlines the specification for adding and managing benefits in the YomU application.

## Overview

Benefits are categorized by their validity period relative to a user's birthday or anniversary. Each benefit has a specific validity type that determines when it becomes active for users.

## Validity Types

### Birthday Benefits

| Validity Type                | Description                                    | When Active                              | Display Text              |
| ---------------------------- | ---------------------------------------------- | ---------------------------------------- | ------------------------- |
| `birthday_exact_date`        | Only valid on the exact birthday date          | Exact birthday date only                 | "תקף ביום ההולדת בלבד"    |
| `birthday_entire_month`      | Valid for the entire birthday month            | Entire birthday month                    | "תקף לכל החודש"           |
| `birthday_week_before_after` | Valid for a week before and after the birthday | 7 days before to 7 days after birthday   | "תקף לשבוע לפני ואחרי"    |
| `birthday_weekend`           | Valid for the weekend of the birthday          | 2 days before to 2 days after birthday   | "תקף לשבוע של יום ההולדת" |
| `birthday_30_days`           | Valid for 30 days from the birthday            | 30 days before to 30 days after birthday | "תקף ל-30 ימים"           |
| `birthday_7_days_before`     | Valid for 7 days before the birthday           | 7 days before birthday only              | "תקף ל-7 ימים לפני"       |
| `birthday_7_days_after`      | Valid for 7 days after the birthday            | 7 days after birthday only               | "תקף ל-7 ימים אחרי"       |
| `birthday_10_days_after`     | Valid for 10 days after the birthday           | 10 days after birthday only              | "תקף ל-10 ימים אחרי"      |
| `birthday_3_days_before`     | Valid for 3 days before the birthday           | 3 days before birthday only              | "תקף ל-3 ימים לפני"       |
| `birthday_3_days_after`      | Valid for 3 days after the birthday            | 3 days after birthday only               | "תקף ל-3 ימים אחרי"       |

### Anniversary Benefits (Future Use)

| Validity Type                   | Description                                       | When Active                               | Display Text                    |
| ------------------------------- | ------------------------------------------------- | ----------------------------------------- | ------------------------------- |
| `anniversary_exact_date`        | Only valid on the exact anniversary date          | Exact anniversary date only               | "תקף ביום השנה בלבד"            |
| `anniversary_entire_month`      | Valid for the entire anniversary month            | Entire anniversary month                  | "תקף לכל חודש השנה"             |
| `anniversary_week_before_after` | Valid for a week before and after the anniversary | 7 days before to 7 days after anniversary | "תקף לשבוע לפני ואחרי יום השנה" |

## Adding New Benefits

### 1. Database Schema

Benefits are stored in the `benefits` table with the following structure:

```sql
CREATE TABLE benefits (
  id TEXT PRIMARY KEY,
  brandId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  termsAndConditions TEXT,
  redemptionMethod TEXT NOT NULL,
  promoCode TEXT,
  url TEXT,
  termsUrl TEXT,
  validityType TEXT NOT NULL,
  validityDuration INTEGER,
  isActive BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  lastChecked TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Required Fields

When adding a new benefit, ensure all required fields are provided:

- **title**: The benefit title (Hebrew)
- **description**: Detailed description of the benefit (Hebrew)
- **brandId**: ID of the associated brand
- **redemptionMethod**: How to redeem the benefit (Hebrew)
- **validityType**: One of the validity types listed above

### 3. Optional Fields

- **termsAndConditions**: Inline terms summary (Hebrew)
- **promoCode**: Promotional code if applicable
- **url**: Direct link to the benefit or club page
- **termsUrl**: Link to the official full terms PDF or club terms page (resolved per brand in `scripts/seed.js` via `resolveTermsUrl()`)
- **validityDuration**: Number of days the benefit is valid (for reference)
- **verified**: Research confidence flag (`true` when terms/URL confirmed; soft brands seed `false`)
- **lastChecked**: When the benefit/URL was last reviewed (ISO timestamp; often `null` when `verified` is false)

### Catalog examples (seed)

| Brand | Validity | Notes |
| ----- | -------- | ----- |
| McDonald's | `birthday_10_days_after` | גלידה פיצוץ regular size; not for delivery |
| יומנגס - Humongous | `birthday_exact_date` | Free burger on exact birthday |
| BBB | `birthday_entire_month` | Happy BBBirthday drink + starter |
| Minna Tomei | `birthday_entire_month` + `anniversary_entire_month` | ₪55 min order birthday benefit; anniversary first course; official terms PDF in `termsUrl` |
| Soft clubs (H&M, Honigman, etc.) | varies | Seed with `verified: false` until T&Cs confirmed |

### 4. Validation

All benefits are validated using the `validateBenefitData()` function which checks:

- Required fields are present
- Validity type is valid
- Brand exists in the database
- Data types are correct

### 5. Example Benefit Structure

```javascript
{
  brandName: "Brand Name",
  title: "Benefit Title",
  description: "Detailed description of the benefit",
  termsAndConditions: "Terms and conditions text",
  termsUrl: "https://example.com/club-terms.pdf",
  redemptionMethod: "How to redeem the benefit",
  promoCode: "PROMO123", // or null
  url: "https://example.com/benefit",
  validityType: "birthday_entire_month",
  validityDuration: 30
}
```

## Dashboard Logic

### Active Benefits ("פעיל עכשיו")

Benefits appear in the "Active Now" section when:

1. User has a Date of Birth set
2. Benefit's validity type logic returns `true` for the current date
3. User is a member of the brand offering the benefit

### Upcoming Benefits ("בקרוב")

Benefits appear in the "Coming Soon" section when:

1. User has a Date of Birth set
2. Benefit is not currently active but will be active soon
3. User is a member of the brand offering the benefit

### Server-driven windows (source of truth)

`GET /api/benefits` classifies each benefit with `windowStatus`:

| Value | Meaning |
| ----- | ------- |
| `active` | Valid for the user on the evaluation day |
| `upcoming` | Not active now; next birthday/anniversary occurrence is upcoming |
| `none` | No DOB, unknown validity type, or not Active/Upcoming |

- **Timezone:** When `asOf` is omitted, “today” is the calendar day in `Asia/Jerusalem` (YomU product default), **not** the server host timezone (Vercel is UTC). Optional `?tz=` query or `Time-Zone` header may override with an allowlisted IANA zone (`Asia/Jerusalem`, `UTC`); unknown values fall back to `Asia/Jerusalem`. Response includes `timeZone` used.
- Optional query `?asOf=YYYY-MM-DD` pins the evaluation day (process-local calendar components, no UTC shift). **Ignored in production** unless `ALLOW_BENEFIT_ASOF=1` is set (dev/test always honor it).
- Response also includes `evaluatedAt` (ISO timestamp of the day used).
- Dashboard prefers `windowStatus` when present **and** `evaluatedAt` is still the same local calendar day; otherwise it falls back to `isBenefitActive` / `getUpcomingBenefits`. On tab focus/visibility, it refetches when the local day has rolled.

Helpers:

- `getBenefitWindowStatus(benefit, userDOB, currentDate?)`
- `withBenefitWindowStatus(benefit, userDOB, currentDate?)`
- `setBenefitClock` / `resetBenefitClock` / `getBenefitNow` — injectable clock for unit tests
- `parseAsOfDate('YYYY-MM-DD')` — calendar-day parse for API `asOf`
- `getCalendarDayInTimeZone(instant?, timeZone?)` / `resolveBenefitTimeZone(tz?)` — timezone-aware “today”
- `localCalendarDayKey` / `isSameLocalCalendarDay` — client stale-window checks

Calendar-day deltas and Feb 29 → Feb 28 (non-leap) behavior live in `isWithinBirthdayWindow` / `getObservedBirthday`; do not reintroduce month-scoped shortcuts.

## Testing Benefits

### 1. Validation Testing

Use the validation system to test benefit data:

```javascript
import { validateBenefitData } from "@/lib/benefit-validation";

const benefitData = {
  title: "Test Benefit",
  description: "Test description",
  brandId: "brand-id",
  redemptionMethod: "Test method",
  validityType: "birthday_entire_month",
};

const validation = validateBenefitData(benefitData);
console.log(validation.isValid, validation.errors);
```

### 2. Activity Testing

Test if a benefit is active for a user:

```javascript
import {
  isBenefitActive,
  getBenefitWindowStatus,
  setBenefitClock,
  resetBenefitClock,
} from "@/lib/benefit-validation";

const userDOB = new Date(1990, 7, 15); // Aug 15 local
setBenefitClock(new Date(2024, 7, 15));
try {
  const isActive = isBenefitActive(benefit, userDOB);
  const window = getBenefitWindowStatus(benefit, userDOB); // 'active'
} finally {
  resetBenefitClock();
}
```

## Seeding Benefits

Use the comprehensive seeding script to add benefits with validation:

```bash
node scripts/seed-with-validation.js
```

This script will:

1. Validate all benefit data before insertion
2. Show detailed error messages for invalid data
3. Provide a summary of successful and failed insertions
4. Show distribution of benefits by validity type

## Best Practices

### 1. Validity Type Selection

- Use `birthday_exact_date` for benefits valid only on the birthday
- Use `birthday_entire_month` for benefits valid throughout the birthday month
- Use `birthday_week_before_after` for benefits with flexible timing
- Use specific day ranges (e.g., `birthday_7_days_before`) for precise timing

### 2. Content Guidelines

- Write all content in Hebrew
- Be specific about redemption methods
- Include clear terms and conditions
- Provide accurate validity periods

### 3. Testing

- Test benefits with different user birth dates
- Verify active/upcoming logic works correctly
- Test edge cases (month boundaries, leap years)

## Error Handling

The system includes comprehensive error handling:

- Invalid validity types are rejected
- Missing required fields are flagged
- Database errors are logged with details
- Validation errors are displayed clearly

## Future Enhancements

1. **Custom Validity Periods**: Allow custom day ranges
2. **Seasonal Benefits**: Benefits tied to seasons or holidays
3. **Geographic Benefits**: Location-based benefit availability
4. **Dynamic Pricing**: Benefits that change based on user behavior

## Multi-DOB / Anniversary (shipped)

- `User.anniversaryDate` drives `anniversary_*` validity types via `isBenefitActiveForContext`.
- `AdditionalBirthday` rows (label + DOB) unlock family/other birthday views; dashboard profile switcher selects the active DOB.

## Support

For questions about adding benefits or the validation system, refer to:

- `src/lib/benefit-validation.ts` - Core validation logic
- `scripts/seed-with-validation.js` - Example seeding script
- Dashboard filtering logic in `src/app/dashboard/page.tsx`
