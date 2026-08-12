/**
 * Reminder scheduling / candidate collection / auth helpers.
 */
import {
  buildReminderCopy,
  collectReminderCandidates,
  getDaysUntilBenefitActive,
  getNextBenefitActivationDate,
  isValidCronSecret,
  parseLeadDays,
  REMINDER_TYPE_ACTIVE,
  REMINDER_TYPE_UPCOMING,
  runReminderPipeline,
  shouldNotifyOnActive,
  type MembershipForReminders,
  type ReminderPrisma,
} from '@/lib/reminders';

function membership(overrides: {
  remindEnabled?: boolean;
  isActive?: boolean;
  dob?: Date | null;
  email?: string | null;
  benefits?: MembershipForReminders['brand'] extends null
    ? never
    : NonNullable<MembershipForReminders['brand']>['benefits'];
}): MembershipForReminders {
  return {
    userId: 'u1',
    remindEnabled: overrides.remindEnabled ?? true,
    isActive: overrides.isActive ?? true,
    user: {
      id: 'u1',
      email: overrides.email ?? 'user@example.com',
      dateOfBirth:
        overrides.dob === undefined ? new Date(1990, 5, 15) : overrides.dob,
    },
    brand: {
      id: 'b1',
      name: 'TestBrand',
      benefits: overrides.benefits ?? [
        {
          id: 'ben1',
          title: 'Free dessert',
          validityType: 'birthday_exact_date',
          isActive: true,
        },
      ],
    },
  };
}

describe('getDaysUntilBenefitActive', () => {
  it('returns 0 when exact birthday is today', () => {
    const dob = new Date(1990, 5, 15);
    const today = new Date(2026, 5, 15);
    expect(getDaysUntilBenefitActive('birthday_exact_date', dob, today)).toBe(
      0
    );
  });

  it('returns lead days before exact birthday', () => {
    const dob = new Date(1990, 5, 15);
    const sevenBefore = new Date(2026, 5, 8);
    expect(
      getDaysUntilBenefitActive('birthday_exact_date', dob, sevenBefore)
    ).toBe(7);
  });

  it('opens entire-month window on the 1st', () => {
    const dob = new Date(1990, 5, 15);
    const may1 = new Date(2026, 5, 1);
    expect(getDaysUntilBenefitActive('birthday_entire_month', dob, may1)).toBe(
      0
    );
    const may25 = new Date(2026, 4, 25);
    expect(getDaysUntilBenefitActive('birthday_entire_month', dob, may25)).toBe(
      7
    );
  });

  it('accounts for daysBefore on week window', () => {
    const dob = new Date(1990, 5, 15);
    // Window opens June 8 (birthday - 7)
    const june1 = new Date(2026, 5, 1);
    expect(
      getDaysUntilBenefitActive('birthday_week_before_after', dob, june1)
    ).toBe(7);
  });

  it('returns null for always', () => {
    const dob = new Date(1990, 5, 15);
    expect(
      getDaysUntilBenefitActive('always', dob, new Date(2026, 0, 1))
    ).toBeNull();
  });

  it('getNextBenefitActivationDate matches days helper', () => {
    const dob = new Date(1990, 5, 15);
    const today = new Date(2026, 5, 8);
    const next = getNextBenefitActivationDate(
      'birthday_exact_date',
      dob,
      today
    );
    expect(next?.getFullYear()).toBe(2026);
    expect(next?.getMonth()).toBe(5);
    expect(next?.getDate()).toBe(15);
  });
});

describe('parseLeadDays / shouldNotifyOnActive', () => {
  it('defaults lead days', () => {
    expect(parseLeadDays(undefined)).toEqual([7, 3, 1]);
    expect(parseLeadDays('')).toEqual([7, 3, 1]);
    expect(parseLeadDays('5, 2')).toEqual([5, 2]);
  });

  it('defaults notify-on-active to true', () => {
    expect(shouldNotifyOnActive(undefined)).toBe(true);
    expect(shouldNotifyOnActive('0')).toBe(false);
    expect(shouldNotifyOnActive('false')).toBe(false);
  });
});

describe('collectReminderCandidates', () => {
  const currentDate = new Date(2026, 5, 8); // 7 days before June 15

  it('emits upcoming when days match lead list', () => {
    const candidates = collectReminderCandidates([membership({})], {
      currentDate,
      leadDays: [7, 3, 1],
      language: 'en',
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0].reminderType).toBe(REMINDER_TYPE_UPCOMING);
    expect(candidates[0].daysUntilActive).toBe(7);
  });

  it('skips when remindEnabled is false', () => {
    const candidates = collectReminderCandidates(
      [membership({ remindEnabled: false })],
      { currentDate, leadDays: [7] }
    );
    expect(candidates).toHaveLength(0);
  });

  it('skips inactive memberships', () => {
    const candidates = collectReminderCandidates(
      [membership({ isActive: false })],
      { currentDate, leadDays: [7] }
    );
    expect(candidates).toHaveLength(0);
  });

  it('emits active reminder on birthday', () => {
    const birthday = new Date(2026, 5, 15);
    const candidates = collectReminderCandidates([membership({})], {
      currentDate: birthday,
      notifyOnActive: true,
      language: 'he',
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0].reminderType).toBe(REMINDER_TYPE_ACTIVE);
  });

  it('skips active reminder when notifyOnActive is false', () => {
    const birthday = new Date(2026, 5, 15);
    const candidates = collectReminderCandidates([membership({})], {
      currentDate: birthday,
      notifyOnActive: false,
      leadDays: [7, 3, 1],
    });
    expect(candidates).toHaveLength(0);
  });
});

describe('buildReminderCopy', () => {
  it('interpolates English upcoming copy', () => {
    const copy = buildReminderCopy({
      language: 'en',
      brandName: 'Acme',
      benefitTitle: 'Free coffee',
      daysUntilActive: 3,
      reminderType: REMINDER_TYPE_UPCOMING,
    });
    expect(copy.title).toContain('Acme');
    expect(copy.message).toContain('Free coffee');
    expect(copy.message).toContain('3');
  });

  it('interpolates Hebrew active copy', () => {
    const copy = buildReminderCopy({
      language: 'he',
      brandName: 'סופר-פארם',
      benefitTitle: 'מתנה',
      daysUntilActive: 0,
      reminderType: REMINDER_TYPE_ACTIVE,
    });
    expect(copy.title).toContain('סופר-פארם');
    expect(copy.message).toContain('מתנה');
  });
});

describe('isValidCronSecret', () => {
  it('accepts matching Bearer token', () => {
    expect(isValidCronSecret('Bearer s3cret', 's3cret')).toBe(true);
  });

  it('rejects mismatch / missing', () => {
    expect(isValidCronSecret('Bearer nope', 's3cret')).toBe(false);
    expect(isValidCronSecret(null, 's3cret')).toBe(false);
    expect(isValidCronSecret('Bearer s3cret', undefined)).toBe(false);
  });
});

describe('runReminderPipeline', () => {
  it('creates notifications and skips duplicates; respects remind filter via findMany', async () => {
    const created: unknown[] = [];
    const db: ReminderPrisma = {
      userMembership: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            membership({}),
            membership({ remindEnabled: false }),
          ]),
      },
      notification: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'existing' }),
        create: jest.fn().mockImplementation(async (args) => {
          created.push(args);
          return { id: 'n1' };
        }),
      },
    };

    // First run: memberships include disabled one but collect filters it;
    // only one candidate from enabled membership.
    const first = await runReminderPipeline(db, {
      currentDate: new Date(2026, 5, 8),
      leadDays: [7],
      language: 'en',
      sendEmail: async () => false,
    });
    expect(first.created).toBe(1);
    expect(first.skippedDuplicate).toBe(0);
    expect(db.notification.create).toHaveBeenCalledTimes(1);

    // Simulate second call same day → duplicate
    (db.notification.findFirst as jest.Mock).mockResolvedValue({ id: 'x' });
    const second = await runReminderPipeline(db, {
      currentDate: new Date(2026, 5, 8),
      leadDays: [7],
      language: 'en',
      sendEmail: async () => false,
    });
    expect(second.skippedDuplicate).toBe(1);
    expect(second.created).toBe(0);
  });

  it('does not pass remindEnabled=false rows when query filters (integration-shaped)', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const db: ReminderPrisma = {
      userMembership: { findMany },
      notification: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    await runReminderPipeline(db, { currentDate: new Date(2026, 5, 8) });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          remindEnabled: true,
          isActive: true,
        }),
      })
    );
  });
});
