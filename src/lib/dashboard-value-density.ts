/**
 * Dashboard "value density" helpers: window urgency, trust, redemption checklist,
 * and next-year reopen memory from UsedBenefit — without inventing schema fields.
 */
import {
  getObservedBirthday,
  LEGACY_VALIDITY_TYPES,
} from '@/lib/benefit-validation';

export const ENDING_SOON_DAYS = 7;

export type RedemptionChecklistKey =
  'card' | 'app' | 'code' | 'inStore' | 'online' | 'noStacking';

export interface ValueDensityBenefit {
  id?: string;
  title?: string;
  validityType: string;
  validityDuration?: number | null;
  isFree?: boolean | null;
  redemptionMethod?: string | null;
  promoCode?: string | null;
  termsAndConditions?: string | null;
  description?: string | null;
  verified?: boolean | null;
  lastChecked?: string | Date | null;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function normalizeValidityType(validityType: string): string {
  return LEGACY_VALIDITY_TYPES[validityType] || validityType;
}

/** Symmetric / asymmetric day windows relative to observed birthday. */
function getRelativeWindow(
  normalizedType: string
): { before: number; after: number } | null {
  switch (normalizedType) {
    case 'birthday_exact_date':
    case 'anniversary_exact_date':
      return { before: 0, after: 0 };
    case 'birthday_week_before_after':
    case 'anniversary_week_before_after':
      return { before: 7, after: 7 };
    case 'birthday_weekend':
      return { before: 2, after: 2 };
    case 'birthday_30_days':
      return { before: 30, after: 30 };
    case 'birthday_7_days_before':
      return { before: 7, after: 0 };
    case 'birthday_7_days_after':
      return { before: 0, after: 7 };
    case 'birthday_10_days_after':
      return { before: 0, after: 10 };
    case 'birthday_3_days_before':
      return { before: 3, after: 0 };
    case 'birthday_3_days_after':
      return { before: 0, after: 3 };
    default:
      return null;
  }
}

function monthWindowBounds(
  dob: Date,
  year: number
): { start: Date; end: Date } {
  const month = dob.getMonth();
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  };
}

function relativeWindowBounds(
  dob: Date,
  year: number,
  before: number,
  after: number
): { start: Date; end: Date } {
  const birthday = getObservedBirthday(dob, year);
  const start = new Date(birthday);
  start.setDate(start.getDate() - before);
  const end = new Date(birthday);
  end.setDate(end.getDate() + after);
  return { start, end };
}

function windowBoundsForYear(
  normalizedType: string,
  dob: Date,
  year: number
): { start: Date; end: Date } | null {
  if (normalizedType === 'always') {
    return null;
  }
  if (
    normalizedType === 'birthday_entire_month' ||
    normalizedType === 'anniversary_entire_month'
  ) {
    return monthWindowBounds(dob, year);
  }
  const rel = getRelativeWindow(normalizedType);
  if (!rel) return null;
  return relativeWindowBounds(dob, year, rel.before, rel.after);
}

/**
 * Nearest window that contains `current`, else the next future window start/end.
 */
export function getNearestBenefitWindow(
  benefit: Pick<ValueDensityBenefit, 'validityType'>,
  userDOB: Date | null,
  currentDate: Date = new Date()
): { start: Date; end: Date } | null {
  if (!userDOB) return null;
  const normalized = normalizeValidityType(benefit.validityType);
  if (normalized === 'always') return null;

  const y = currentDate.getFullYear();
  const candidates: Array<{ start: Date; end: Date }> = [];
  for (const year of [y - 1, y, y + 1, y + 2]) {
    const bounds = windowBoundsForYear(normalized, userDOB, year);
    if (bounds) candidates.push(bounds);
  }
  if (candidates.length === 0) return null;

  const today = startOfLocalDay(currentDate);
  const containing = candidates.find(
    (w) =>
      startOfLocalDay(w.start).getTime() <= today.getTime() &&
      today.getTime() <= startOfLocalDay(w.end).getTime()
  );
  if (containing) return containing;

  const upcoming = candidates
    .filter((w) => startOfLocalDay(w.start).getTime() > today.getTime())
    .sort(
      (a, b) =>
        startOfLocalDay(a.start).getTime() - startOfLocalDay(b.start).getTime()
    );
  return upcoming[0] ?? null;
}

/** Days remaining in the active window; null if not in a bounded window. */
export function getDaysUntilWindowEnds(
  benefit: Pick<ValueDensityBenefit, 'validityType'>,
  userDOB: Date | null,
  currentDate: Date = new Date()
): number | null {
  const window = getNearestBenefitWindow(benefit, userDOB, currentDate);
  if (!window) return null;
  const today = startOfLocalDay(currentDate);
  if (today.getTime() > startOfLocalDay(window.end).getTime()) return null;
  if (today.getTime() < startOfLocalDay(window.start).getTime()) return null;
  return Math.max(0, daysBetween(today, window.end));
}

/** Days until the next (or current) window opens; 0 if already open. */
export function getDaysUntilWindowOpens(
  benefit: Pick<ValueDensityBenefit, 'validityType'>,
  userDOB: Date | null,
  currentDate: Date = new Date()
): number | null {
  const window = getNearestBenefitWindow(benefit, userDOB, currentDate);
  if (!window) return null;
  const today = startOfLocalDay(currentDate);
  if (
    today.getTime() >= startOfLocalDay(window.start).getTime() &&
    today.getTime() <= startOfLocalDay(window.end).getTime()
  ) {
    return 0;
  }
  if (today.getTime() < startOfLocalDay(window.start).getTime()) {
    return daysBetween(today, window.start);
  }
  // Past this window — find next year's
  const normalized = normalizeValidityType(benefit.validityType);
  const next = windowBoundsForYear(
    normalized,
    userDOB!,
    currentDate.getFullYear() + 1
  );
  if (!next) return null;
  return daysBetween(today, next.start);
}

/**
 * After a UsedBenefit mark: days until the *next* window that starts after usedAt
 * (and not before today). If the benefit is currently in an open window, return 0
 * so UI does not show a next-year "opens again" countdown while Active Now.
 */
export function getDaysUntilReopens(
  benefit: Pick<ValueDensityBenefit, 'validityType'>,
  userDOB: Date | null,
  usedAt: Date | string | null | undefined,
  currentDate: Date = new Date()
): number | null {
  if (!userDOB || !usedAt) return null;
  const used = startOfLocalDay(new Date(usedAt));
  const today = startOfLocalDay(currentDate);
  const normalized = normalizeValidityType(benefit.validityType);
  if (normalized === 'always') return null;

  // Currently active → no reopen countdown (window is open now).
  const currentWindow = getNearestBenefitWindow(benefit, userDOB, currentDate);
  if (currentWindow) {
    const winStart = startOfLocalDay(currentWindow.start);
    const winEnd = startOfLocalDay(currentWindow.end);
    if (
      today.getTime() >= winStart.getTime() &&
      today.getTime() <= winEnd.getTime()
    ) {
      return 0;
    }
  }

  const y = currentDate.getFullYear();
  const candidates: Date[] = [];
  for (const year of [y - 1, y, y + 1, y + 2]) {
    const bounds = windowBoundsForYear(normalized, userDOB, year);
    if (!bounds) continue;
    const start = startOfLocalDay(bounds.start);
    // Next open after the redemption and strictly after today
    if (start.getTime() > used.getTime() && start.getTime() > today.getTime()) {
      candidates.push(start);
    }
  }
  if (candidates.length === 0) {
    const nextYear = windowBoundsForYear(normalized, userDOB, y + 1);
    if (!nextYear) return null;
    return Math.max(0, daysBetween(today, nextYear.start));
  }
  candidates.sort((a, b) => a.getTime() - b.getTime());
  return daysBetween(today, candidates[0]);
}

/**
 * Trust badge state from optional verified flag.
 * Missing/null verified → omit badge (do not treat as unverified).
 */
export function getTrustBadgeKind(
  verified: boolean | null | undefined
): 'verified' | 'soft' | null {
  if (verified === true) return 'verified';
  if (verified === false) return 'soft';
  return null;
}

export function wasRedeemedPreviousCycle(
  benefit: Pick<ValueDensityBenefit, 'validityType'>,
  userDOB: Date | null,
  usedAt: Date | string | null | undefined,
  currentDate: Date = new Date()
): boolean {
  if (!userDOB || !usedAt) return false;
  const used = startOfLocalDay(new Date(usedAt));
  const window = getNearestBenefitWindow(benefit, userDOB, currentDate);
  if (!window) {
    return used.getFullYear() < currentDate.getFullYear();
  }
  // Redeemed before this window started ⇒ prior cycle
  return used.getTime() < startOfLocalDay(window.start).getTime();
}

export function isEndingSoon(
  benefit: Pick<ValueDensityBenefit, 'validityType'>,
  userDOB: Date | null,
  currentDate: Date = new Date(),
  thresholdDays: number = ENDING_SOON_DAYS
): boolean {
  const daysLeft = getDaysUntilWindowEnds(benefit, userDOB, currentDate);
  return daysLeft !== null && daysLeft <= thresholdDays;
}

/** Active sort: ending-soon first, then free > %, then title. */
export function compareActiveBenefits(
  a: ValueDensityBenefit,
  b: ValueDensityBenefit,
  userDOB: Date | null,
  currentDate: Date = new Date()
): number {
  const aEnding = isEndingSoon(a, userDOB, currentDate) ? 0 : 1;
  const bEnding = isEndingSoon(b, userDOB, currentDate) ? 0 : 1;
  if (aEnding !== bEnding) return aEnding - bEnding;

  const aDays = getDaysUntilWindowEnds(a, userDOB, currentDate);
  const bDays = getDaysUntilWindowEnds(b, userDOB, currentDate);
  if (aDays !== null && bDays !== null && aDays !== bDays) {
    return aDays - bDays;
  }

  const aFree = a.isFree !== false ? 0 : 1;
  const bFree = b.isFree !== false ? 0 : 1;
  if (aFree !== bFree) return aFree - bFree;

  return (a.title || '').localeCompare(b.title || '', undefined, {
    sensitivity: 'base',
  });
}

/** Upcoming sort: free first, then sooner open, then title. */
export function compareUpcomingBenefits(
  a: ValueDensityBenefit,
  b: ValueDensityBenefit,
  userDOB: Date | null,
  currentDate: Date = new Date()
): number {
  const aFree = a.isFree !== false ? 0 : 1;
  const bFree = b.isFree !== false ? 0 : 1;
  if (aFree !== bFree) return aFree - bFree;

  const aOpen = getDaysUntilWindowOpens(a, userDOB, currentDate);
  const bOpen = getDaysUntilWindowOpens(b, userDOB, currentDate);
  if (aOpen !== null && bOpen !== null && aOpen !== bOpen) {
    return aOpen - bOpen;
  }

  return (a.title || '').localeCompare(b.title || '', undefined, {
    sensitivity: 'base',
  });
}

function haystackForTerms(benefit: ValueDensityBenefit): string {
  return [
    benefit.redemptionMethod || '',
    benefit.termsAndConditions || '',
    benefit.description || '',
    benefit.promoCode ? 'promo code' : '',
  ]
    .join(' ')
    .toLowerCase();
}

/** Explicit app redemption methods — not show-app / show_app. */
const APP_REDEMPTION_METHODS = new Set([
  'app',
  'mobile-app',
  'mobile_app',
  'in-app',
  'in_app',
]);

/**
 * True when method/text indicates genuine app redemption.
 * Hyphenated tokens like show-app must not match via `\bapp\b`.
 */
function hasAppRedemptionEvidence(method: string, text: string): boolean {
  if (APP_REDEMPTION_METHODS.has(method)) return true;
  // Hebrew "אפליקצ*" or standalone "app" / "mobile app" (no hyphen/underscore neighbors)
  return /אפליקצ|mobile\s+app|(?<![\w-])app(?![\w-])/.test(text);
}

/**
 * Structured redemption checklist from existing fields only.
 * Keys are only included when evidence is present.
 */
export function parseRedemptionChecklist(
  benefit: ValueDensityBenefit
): RedemptionChecklistKey[] {
  const keys = new Set<RedemptionChecklistKey>();
  const method = (benefit.redemptionMethod || '').toLowerCase().trim();
  const text = haystackForTerms(benefit);

  if (hasAppRedemptionEvidence(method, text)) {
    keys.add('app');
  }
  if (
    method === 'in-store' ||
    method === 'instore' ||
    /in[- ]?store|בישיבה|בחנות|בסניף|sit[- ]?down/.test(text)
  ) {
    keys.add('inStore');
  }
  if (method === 'online' || /online|באתר|אינטרנט|website/.test(text)) {
    keys.add('online');
  }
  if (
    benefit.promoCode ||
    method === 'code' ||
    /promo\s*code|קוד\s*קופון|קוד מימוש|\bcode\b/.test(text)
  ) {
    keys.add('code');
  }
  if (/כרטיס|card|dream card|club card|membership card/.test(text)) {
    keys.add('card');
  }
  if (
    /אין כפל|לא ניתן לשלב|no stacking|no double|cannot be combined|not combinable|כפל מבצעים/.test(
      text
    )
  ) {
    keys.add('noStacking');
  }

  const order: RedemptionChecklistKey[] = [
    'card',
    'app',
    'code',
    'inStore',
    'online',
    'noStacking',
  ];
  return order.filter((k) => keys.has(k));
}

export function formatLastChecked(
  lastChecked: string | Date | null | undefined,
  locale: string
): string | null {
  if (!lastChecked) return null;
  const d = new Date(lastChecked);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB');
}
