/**
 * Proactive birthday-benefit reminders.
 * Reuses benefit-validation window rules; writes Notification rows
 * (optional email when RESEND_API_KEY is set).
 */
import {
  getObservedBirthday,
  isBenefitActive,
  LEGACY_VALIDITY_TYPES,
} from '@/lib/benefit-validation';
import { translations, type Language } from '@/lib/translations';
import {
  maybeSendReminderEmail,
  maybeSendReminderPush,
  maybeSendReminderSms,
  type PushSubscriptionRow,
} from '@/lib/notification-channels';

export const REMINDER_TYPE_UPCOMING = 'reminder_upcoming';
export const REMINDER_TYPE_ACTIVE = 'reminder_active';

/** Days before window-open when we send an upcoming reminder (default). */
export const DEFAULT_LEAD_DAYS = [7, 3, 1] as const;

export type ReminderWindowOffsets = {
  /** Days before birthday when the window opens (0 = birthday day). */
  daysBefore: number;
  /** Days after birthday when the window closes. */
  daysAfter: number;
  /** Entire calendar month of the birthday (ignores day offsets). */
  entireMonth?: boolean;
};

/**
 * Window offsets aligned with VALIDITY_TYPES in benefit-validation.ts.
 * `always` is omitted (not remindable).
 */
export const REMINDER_WINDOW_OFFSETS: Record<string, ReminderWindowOffsets> = {
  birthday_exact_date: { daysBefore: 0, daysAfter: 0 },
  birthday_entire_month: { daysBefore: 0, daysAfter: 0, entireMonth: true },
  birthday_week_before_after: { daysBefore: 7, daysAfter: 7 },
  birthday_weekend: { daysBefore: 2, daysAfter: 2 },
  birthday_30_days: { daysBefore: 30, daysAfter: 30 },
  birthday_7_days_before: { daysBefore: 7, daysAfter: 0 },
  birthday_7_days_after: { daysBefore: 0, daysAfter: 7 },
  birthday_3_days_before: { daysBefore: 3, daysAfter: 0 },
  birthday_3_days_after: { daysBefore: 0, daysAfter: 3 },
  anniversary_exact_date: { daysBefore: 0, daysAfter: 0 },
  anniversary_entire_month: { daysBefore: 0, daysAfter: 0, entireMonth: true },
  anniversary_week_before_after: { daysBefore: 7, daysAfter: 7 },
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function daysBetween(from: Date, to: Date): number {
  const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function normalizeValidityType(validityType: string): string {
  return LEGACY_VALIDITY_TYPES[validityType] || validityType;
}

/**
 * Start of the activation window that contains `currentDate`, or null
 * if today is outside every nearby window.
 */
export function getActivationWindowStart(
  validityType: string,
  userDOB: Date,
  currentDate: Date = new Date()
): Date | null {
  const normalized = normalizeValidityType(validityType);
  if (normalized === 'always') return null;

  const offsets = REMINDER_WINDOW_OFFSETS[normalized];
  if (!offsets) return null;

  const today = startOfLocalDay(currentDate);
  const y = today.getFullYear();

  for (const year of [y - 1, y, y + 1]) {
    let windowStart: Date;
    let windowEnd: Date;
    if (offsets.entireMonth) {
      windowStart = new Date(year, userDOB.getMonth(), 1);
      windowEnd = new Date(year, userDOB.getMonth() + 1, 0);
    } else {
      const birthday = getObservedBirthday(userDOB, year);
      windowStart = addDays(birthday, -offsets.daysBefore);
      windowEnd = addDays(birthday, offsets.daysAfter);
    }

    const start = startOfLocalDay(windowStart);
    const end = startOfLocalDay(windowEnd);
    if (
      today.getTime() >= start.getTime() &&
      today.getTime() <= end.getTime()
    ) {
      return start;
    }
  }

  return null;
}

/**
 * Next calendar day the benefit becomes Active for this DOB
 * (or the start of the current window if already active).
 * Null when not remindable.
 */
export function getNextBenefitActivationDate(
  validityType: string,
  userDOB: Date,
  currentDate: Date = new Date()
): Date | null {
  const normalized = normalizeValidityType(validityType);
  if (normalized === 'always') return null;

  const offsets = REMINDER_WINDOW_OFFSETS[normalized];
  if (!offsets) return null;

  // While active, return window *start* (not today) so daysUntil === 0
  // only on the first active day — avoids daily reminder_active spam.
  if (isBenefitActive({ validityType: normalized }, userDOB, currentDate)) {
    return (
      getActivationWindowStart(normalized, userDOB, currentDate) ??
      startOfLocalDay(currentDate)
    );
  }

  const today = startOfLocalDay(currentDate);
  const y = today.getFullYear();

  for (const year of [y - 1, y, y + 1, y + 2]) {
    let windowStart: Date;
    if (offsets.entireMonth) {
      windowStart = new Date(year, userDOB.getMonth(), 1);
    } else {
      const birthday = getObservedBirthday(userDOB, year);
      windowStart = addDays(birthday, -offsets.daysBefore);
    }

    if (windowStart.getTime() >= today.getTime()) {
      return windowStart;
    }
  }

  return null;
}

/**
 * Days until Active (0 = first day of the active window; negative = later
 * in the same window; positive = upcoming). Null when not remindable.
 */
export function getDaysUntilBenefitActive(
  validityType: string,
  userDOB: Date,
  currentDate: Date = new Date()
): number | null {
  const activation = getNextBenefitActivationDate(
    validityType,
    userDOB,
    currentDate
  );
  if (!activation) return null;
  return daysBetween(currentDate, activation);
}

export function parseLeadDays(
  raw: string | undefined = process.env.REMINDER_LEAD_DAYS
): number[] {
  if (!raw || !raw.trim()) return [...DEFAULT_LEAD_DAYS];
  const parsed = raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return parsed.length > 0 ? parsed : [...DEFAULT_LEAD_DAYS];
}

export function shouldNotifyOnActive(
  raw: string | undefined = process.env.REMINDER_NOTIFY_ON_ACTIVE
): boolean {
  if (raw === undefined || raw === '') return true;
  return raw === '1' || raw.toLowerCase() === 'true';
}

export type ReminderCandidate = {
  userId: string;
  email: string | null;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
  phoneNumber: string | null;
  language: Language;
  benefitId: string;
  benefitTitle: string;
  brandName: string;
  validityType: string;
  daysUntilActive: number;
  reminderType: typeof REMINDER_TYPE_UPCOMING | typeof REMINDER_TYPE_ACTIVE;
};

export type ReminderCopy = { title: string; message: string };

export function buildReminderCopy(
  candidate: Pick<
    ReminderCandidate,
    | 'language'
    | 'benefitTitle'
    | 'brandName'
    | 'daysUntilActive'
    | 'reminderType'
  >
): ReminderCopy {
  const t = translations[candidate.language] ?? translations.he;
  const benefit = candidate.benefitTitle;
  const brand = candidate.brandName;
  const days = String(candidate.daysUntilActive);

  if (candidate.reminderType === REMINDER_TYPE_ACTIVE) {
    return {
      title: (t.reminderActiveTitle || '').replace('{brand}', brand),
      message: (t.reminderActiveMessage || '')
        .replace('{benefit}', benefit)
        .replace('{brand}', brand),
    };
  }

  return {
    title: (t.reminderUpcomingTitle || '').replace('{brand}', brand),
    message: (t.reminderUpcomingMessage || '')
      .replace('{benefit}', benefit)
      .replace('{brand}', brand)
      .replace('{days}', days),
  };
}

export type MembershipForReminders = {
  userId: string;
  remindEnabled: boolean;
  isActive: boolean;
  user: {
    id: string;
    email: string | null;
    dateOfBirth: Date | null;
    notifyEmail?: boolean;
    notifyPush?: boolean;
    notifySms?: boolean;
    phoneNumber?: string | null;
  };
  brand: {
    id: string;
    name: string;
    benefits: Array<{
      id: string;
      title: string;
      validityType: string;
      isActive: boolean;
    }>;
  } | null;
};

export function collectReminderCandidates(
  memberships: MembershipForReminders[],
  options: {
    currentDate?: Date;
    leadDays?: number[];
    notifyOnActive?: boolean;
    language?: Language;
  } = {}
): ReminderCandidate[] {
  const currentDate = options.currentDate ?? new Date();
  const leadDays = options.leadDays ?? parseLeadDays();
  const notifyOnActive = options.notifyOnActive ?? shouldNotifyOnActive();
  const language = options.language ?? 'he';
  const leadSet = new Set(leadDays);
  const out: ReminderCandidate[] = [];

  const channelPrefs = (user: MembershipForReminders['user']) => ({
    notifyEmail: user.notifyEmail !== false,
    notifyPush: user.notifyPush !== false,
    notifySms: user.notifySms === true,
    phoneNumber: user.phoneNumber ?? null,
  });

  for (const membership of memberships) {
    if (!membership.isActive || membership.remindEnabled === false) continue;
    if (!membership.brand || !membership.user.dateOfBirth) continue;

    const dob = membership.user.dateOfBirth;
    for (const benefit of membership.brand.benefits) {
      if (!benefit.isActive) continue;

      const daysUntil = getDaysUntilBenefitActive(
        benefit.validityType,
        dob,
        currentDate
      );
      if (daysUntil === null) continue;

      // First day of the activation window only (not every day while Active).
      if (daysUntil === 0 && notifyOnActive) {
        out.push({
          userId: membership.user.id,
          email: membership.user.email,
          ...channelPrefs(membership.user),
          language,
          benefitId: benefit.id,
          benefitTitle: benefit.title,
          brandName: membership.brand.name,
          validityType: benefit.validityType,
          daysUntilActive: 0,
          reminderType: REMINDER_TYPE_ACTIVE,
        });
        continue;
      }

      if (daysUntil > 0 && leadSet.has(daysUntil)) {
        out.push({
          userId: membership.user.id,
          email: membership.user.email,
          ...channelPrefs(membership.user),
          language,
          benefitId: benefit.id,
          benefitTitle: benefit.title,
          brandName: membership.brand.name,
          validityType: benefit.validityType,
          daysUntilActive: daysUntil,
          reminderType: REMINDER_TYPE_UPCOMING,
        });
      }
    }
  }

  return out;
}

export type ReminderPrisma = {
  notification: {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
    create: (args: unknown) => Promise<{ id: string }>;
  };
  userMembership: {
    findMany: (args: unknown) => Promise<MembershipForReminders[]>;
  };
  pushSubscription: {
    findMany: (
      args: unknown
    ) => Promise<Array<PushSubscriptionRow & { userId: string }>>;
  };
};

export type ReminderRunResult = {
  scannedMemberships: number;
  candidates: number;
  created: number;
  skippedDuplicate: number;
  emailsAttempted: number;
  emailsSent: number;
  pushAttempted: number;
  pushSent: number;
  smsAttempted: number;
  smsSent: number;
  errors: string[];
};

function dedupeKeyDay(date: Date): { gte: Date; lt: Date } {
  const gte = startOfLocalDay(date);
  const lt = addDays(gte, 1);
  return { gte, lt };
}

/**
 * @deprecated Import from `@/lib/notification-channels` instead.
 */
export { maybeSendReminderEmail } from '@/lib/notification-channels';

export async function runReminderPipeline(
  db: ReminderPrisma,
  options: {
    currentDate?: Date;
    leadDays?: number[];
    notifyOnActive?: boolean;
    language?: Language;
    sendEmail?: typeof maybeSendReminderEmail;
    sendPush?: typeof maybeSendReminderPush;
    sendSms?: typeof maybeSendReminderSms;
  } = {}
): Promise<ReminderRunResult> {
  const currentDate = options.currentDate ?? new Date();
  const sendEmail = options.sendEmail ?? maybeSendReminderEmail;
  const sendPush = options.sendPush ?? maybeSendReminderPush;
  const sendSms = options.sendSms ?? maybeSendReminderSms;
  const result: ReminderRunResult = {
    scannedMemberships: 0,
    candidates: 0,
    created: 0,
    skippedDuplicate: 0,
    emailsAttempted: 0,
    emailsSent: 0,
    pushAttempted: 0,
    pushSent: 0,
    smsAttempted: 0,
    smsSent: 0,
    errors: [],
  };

  const memberships = await db.userMembership.findMany({
    where: {
      isActive: true,
      remindEnabled: true,
      brandId: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          dateOfBirth: true,
          notifyEmail: true,
          notifyPush: true,
          notifySms: true,
          phoneNumber: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          benefits: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              validityType: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  result.scannedMemberships = memberships.length;
  const candidates = collectReminderCandidates(memberships, {
    currentDate,
    leadDays: options.leadDays,
    notifyOnActive: options.notifyOnActive,
    language: options.language,
  });
  result.candidates = candidates.length;

  const userIds = [...new Set(candidates.map((c) => c.userId))];
  const pushRows =
    userIds.length > 0
      ? await db.pushSubscription.findMany({
          where: { userId: { in: userIds } },
          select: { userId: true, endpoint: true, p256dh: true, auth: true },
        })
      : [];
  const pushByUser = new Map<string, PushSubscriptionRow[]>();
  for (const row of pushRows) {
    const list = pushByUser.get(row.userId) ?? [];
    list.push({
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
    });
    pushByUser.set(row.userId, list);
  }

  const dayRange = dedupeKeyDay(currentDate);

  for (const candidate of candidates) {
    try {
      // Upcoming: same calendar day. Active: since window open (defense in depth
      // if a candidate ever slipped through mid-window).
      let createdAtRange = dayRange;
      if (candidate.reminderType === REMINDER_TYPE_ACTIVE) {
        const membership = memberships.find(
          (m) => m.user.id === candidate.userId
        );
        const dob = membership?.user.dateOfBirth;
        if (dob) {
          const windowStart = getActivationWindowStart(
            candidate.validityType,
            dob,
            currentDate
          );
          if (windowStart) {
            createdAtRange = {
              gte: startOfLocalDay(windowStart),
              lt: addDays(startOfLocalDay(currentDate), 1),
            };
          }
        }
      }

      const existing = await db.notification.findFirst({
        where: {
          userId: candidate.userId,
          benefitId: candidate.benefitId,
          type: candidate.reminderType,
          createdAt: {
            gte: createdAtRange.gte,
            lt: createdAtRange.lt,
          },
        },
        select: { id: true },
      });

      if (existing) {
        result.skippedDuplicate += 1;
        continue;
      }

      const copy = buildReminderCopy(candidate);
      await db.notification.create({
        data: {
          userId: candidate.userId,
          benefitId: candidate.benefitId,
          type: candidate.reminderType,
          title: copy.title,
          message: copy.message,
          scheduledFor: currentDate,
          sentAt: currentDate,
        },
      });
      result.created += 1;

      if (candidate.notifyEmail && candidate.email) {
        result.emailsAttempted += 1;
        const sent = await sendEmail(candidate, copy);
        if (sent) result.emailsSent += 1;
      }

      if (candidate.notifyPush) {
        const subs = pushByUser.get(candidate.userId) ?? [];
        if (subs.length > 0) {
          result.pushAttempted += 1;
          const pushCount = await sendPush(candidate, copy, subs);
          if (pushCount > 0) result.pushSent += pushCount;
        }
      }

      if (candidate.notifySms && candidate.phoneNumber) {
        result.smsAttempted += 1;
        const sent = await sendSms(candidate, copy);
        if (sent) result.smsSent += 1;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${candidate.userId}/${candidate.benefitId}: ${msg}`);
    }
  }

  return result;
}

/**
 * Timing-safe Bearer CRON_SECRET check (used by cron route gates).
 * Route-level policy: GET = secret only; POST = secret or requireAdmin.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function isValidCronSecret(
  authHeader: string | null,
  secret: string | undefined = process.env.CRON_SECRET
): boolean {
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  return timingSafeEqualString(authHeader, expected);
}
