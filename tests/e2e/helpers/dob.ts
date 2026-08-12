/**
 * Calendar-local DOB helpers for authenticated e2e determinism.
 * Prefer relative day offsets over a fixed historic DOB so Active vs Upcoming
 * stay stable without injecting a clock into the Next.js server.
 */

/** Local calendar date at noon (avoids TZ day-shift when stored as timestamptz). */
export function localNoonDate(
  year: number,
  monthIndex: number,
  day: number
): Date {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

/**
 * DOB whose month/day is `offsetDays` from `now`'s local calendar day.
 * Positive = birthday in the future; negative = birthday in the past.
 */
export function dateOfBirthDaysFromToday(
  offsetDays: number,
  now: Date = new Date()
): Date {
  const base = startOfLocalDay(now);
  base.setDate(base.getDate() + offsetDays);
  return localNoonDate(base.getFullYear(), base.getMonth(), base.getDate());
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Golden-path offsets (relative to "today"):
 * - Birthday in 10 days ⇒ `birthday_30_days` is Active, `birthday_exact_date` is Upcoming.
 */
export const GOLDEN_PATH_DOB_OFFSET_DAYS = 10;
