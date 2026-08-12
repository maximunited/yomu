import {
  getBenefitWindowStatus,
  withBenefitWindowStatus,
  parseAsOfDate,
  setBenefitClock,
  resetBenefitClock,
  getBenefitNow,
  isBenefitActive,
  getUpcomingBenefits,
  getCalendarDayInTimeZone,
  resolveBenefitTimeZone,
  localCalendarDayKey,
  isSameLocalCalendarDay,
  DEFAULT_BENEFIT_TIMEZONE,
} from '@/lib/benefit-validation';

describe('benefit window status + clock', () => {
  afterEach(() => {
    resetBenefitClock();
  });

  describe('parseAsOfDate', () => {
    it('parses YYYY-MM-DD as local calendar day', () => {
      const d = parseAsOfDate('2024-06-15');
      expect(d).not.toBeNull();
      expect(d!.getFullYear()).toBe(2024);
      expect(d!.getMonth()).toBe(5);
      expect(d!.getDate()).toBe(15);
    });

    it('rejects invalid and non-calendar values', () => {
      expect(parseAsOfDate(null)).toBeNull();
      expect(parseAsOfDate('')).toBeNull();
      expect(parseAsOfDate('2024-13-01')).toBeNull();
      expect(parseAsOfDate('2024-02-30')).toBeNull();
      expect(parseAsOfDate('2024/06/15')).toBeNull();
      expect(parseAsOfDate('not-a-date')).toBeNull();
    });
  });

  describe('timezone helpers', () => {
    it('resolveBenefitTimeZone allowlists and defaults to Asia/Jerusalem', () => {
      expect(resolveBenefitTimeZone(null)).toBe(DEFAULT_BENEFIT_TIMEZONE);
      expect(resolveBenefitTimeZone('')).toBe('Asia/Jerusalem');
      expect(resolveBenefitTimeZone('UTC')).toBe('UTC');
      expect(resolveBenefitTimeZone('Asia/Jerusalem')).toBe('Asia/Jerusalem');
      expect(resolveBenefitTimeZone('America/New_York')).toBe('Asia/Jerusalem');
      expect(resolveBenefitTimeZone('not-a-zone')).toBe('Asia/Jerusalem');
    });

    it('getCalendarDayInTimeZone uses Asia/Jerusalem across UTC midnight', () => {
      // 2024-06-14 22:30 UTC = 2024-06-15 01:30 Asia/Jerusalem (IDT, UTC+3)
      const utcEvening = new Date(Date.UTC(2024, 5, 14, 22, 30, 0));
      const jerusalemDay = getCalendarDayInTimeZone(
        utcEvening,
        'Asia/Jerusalem'
      );
      expect(jerusalemDay.getFullYear()).toBe(2024);
      expect(jerusalemDay.getMonth()).toBe(5);
      expect(jerusalemDay.getDate()).toBe(15);

      const utcDay = getCalendarDayInTimeZone(utcEvening, 'UTC');
      expect(utcDay.getFullYear()).toBe(2024);
      expect(utcDay.getMonth()).toBe(5);
      expect(utcDay.getDate()).toBe(14);
    });

    it('localCalendarDayKey / isSameLocalCalendarDay compare process-local days', () => {
      const a = new Date(2024, 5, 15, 1, 0, 0);
      const b = new Date(2024, 5, 15, 23, 0, 0);
      const c = new Date(2024, 5, 16, 0, 0, 0);
      expect(localCalendarDayKey(a)).toBe('2024-06-15');
      expect(isSameLocalCalendarDay(a, b)).toBe(true);
      expect(isSameLocalCalendarDay(a, c)).toBe(false);
    });
  });

  describe('setBenefitClock', () => {
    it('makes omitted currentDate use the fixed clock', () => {
      const dob = new Date(1990, 5, 15); // Jun 15
      setBenefitClock(new Date(2024, 5, 15));
      expect(
        isBenefitActive({ validityType: 'birthday_exact_date' }, dob)
      ).toBe(true);
      expect(
        getBenefitWindowStatus({ validityType: 'birthday_exact_date' }, dob)
      ).toBe('active');

      setBenefitClock(new Date(2024, 4, 1)); // May 1
      expect(
        isBenefitActive({ validityType: 'birthday_exact_date' }, dob)
      ).toBe(false);
      expect(
        getBenefitWindowStatus({ validityType: 'birthday_exact_date' }, dob)
      ).toBe('upcoming');
    });

    it('getBenefitNow returns a copy of the override', () => {
      const fixed = new Date(2024, 0, 2, 12, 0, 0);
      setBenefitClock(fixed);
      const a = getBenefitNow();
      const b = getBenefitNow();
      expect(a.getTime()).toBe(fixed.getTime());
      expect(a).not.toBe(b);
      a.setFullYear(1999);
      expect(getBenefitNow().getFullYear()).toBe(2024);
    });
  });

  describe('getBenefitWindowStatus', () => {
    const dob = new Date(1990, 7, 15); // Aug 15

    it('returns none without DOB', () => {
      expect(
        getBenefitWindowStatus(
          { validityType: 'birthday_exact_date' },
          null,
          new Date(2024, 7, 15)
        )
      ).toBe('none');
    });

    it('classifies active on exact birthday', () => {
      expect(
        getBenefitWindowStatus(
          { validityType: 'birthday_exact_date' },
          dob,
          new Date(2024, 7, 15)
        )
      ).toBe('active');
    });

    it('classifies upcoming when not yet active', () => {
      expect(
        getBenefitWindowStatus(
          { validityType: 'birthday_exact_date' },
          dob,
          new Date(2024, 0, 10)
        )
      ).toBe('upcoming');
      expect(
        getUpcomingBenefits(
          { validityType: 'birthday_exact_date' },
          dob,
          new Date(2024, 0, 10)
        )
      ).toBe(true);
    });

    it('classifies always as active, never upcoming', () => {
      expect(
        getBenefitWindowStatus(
          { validityType: 'always' },
          dob,
          new Date(2024, 0, 1)
        )
      ).toBe('active');
    });

    it('returns none for unknown validity types', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(
        getBenefitWindowStatus(
          { validityType: 'not_a_real_type' },
          dob,
          new Date(2024, 7, 15)
        )
      ).toBe('none');
      warn.mockRestore();
    });

    it('preserves leap-day observed birthday (Feb 29 → Feb 28 non-leap)', () => {
      const leapDob = new Date(2000, 1, 29);
      expect(
        getBenefitWindowStatus(
          { validityType: 'birthday_exact_date' },
          leapDob,
          new Date(2023, 1, 28)
        )
      ).toBe('active');
      expect(
        getBenefitWindowStatus(
          { validityType: 'birthday_exact_date' },
          leapDob,
          new Date(2024, 1, 29)
        )
      ).toBe('active');
    });

    it('withBenefitWindowStatus attaches windowStatus', () => {
      const enriched = withBenefitWindowStatus(
        { id: 'b1', validityType: 'birthday_entire_month' },
        dob,
        new Date(2024, 7, 1)
      );
      expect(enriched.windowStatus).toBe('active');
      expect(enriched.id).toBe('b1');
    });
  });
});
