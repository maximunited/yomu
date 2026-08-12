import {
  compareActiveBenefits,
  compareUpcomingBenefits,
  getDaysUntilReopens,
  getDaysUntilWindowEnds,
  isEndingSoon,
  parseRedemptionChecklist,
  wasRedeemedPreviousCycle,
} from '@/lib/dashboard-value-density';

describe('dashboard-value-density', () => {
  const dob = new Date(1990, 7, 15); // Aug 15

  describe('window end / ending soon', () => {
    it('counts days left in birthday month', () => {
      const now = new Date(2026, 7, 20); // Aug 20
      const days = getDaysUntilWindowEnds(
        { validityType: 'birthday_entire_month' },
        dob,
        now
      );
      expect(days).toBe(11); // Aug 20 → Aug 31
      expect(
        isEndingSoon({ validityType: 'birthday_entire_month' }, dob, now)
      ).toBe(false);
    });

    it('flags ending soon within 7 days', () => {
      const now = new Date(2026, 7, 28);
      expect(
        isEndingSoon({ validityType: 'birthday_entire_month' }, dob, now)
      ).toBe(true);
    });
  });

  describe('sort priority', () => {
    it('puts free ahead of paid when urgency ties', () => {
      const now = new Date(2026, 7, 10);
      const free = {
        title: 'Free treat',
        validityType: 'birthday_entire_month',
        isFree: true,
      };
      const paid = {
        title: 'Percent off',
        validityType: 'birthday_entire_month',
        isFree: false,
      };
      expect(compareActiveBenefits(free, paid, dob, now)).toBeLessThan(0);
      expect(compareUpcomingBenefits(free, paid, dob, now)).toBeLessThan(0);
    });

    it('puts ending-soon ahead of later free benefit', () => {
      const now = new Date(2026, 7, 29); // 2 days left in month
      const ending = {
        title: 'Paid ending',
        validityType: 'birthday_entire_month',
        isFree: false,
      };
      const notEnding = {
        title: 'Free long',
        validityType: 'birthday_30_days',
        isFree: true,
      };
      // Aug 15 ±30 still has many days left on Aug 29
      expect(compareActiveBenefits(ending, notEnding, dob, now)).toBeLessThan(
        0
      );
    });
  });

  describe('parseRedemptionChecklist', () => {
    it('derives checklist from method + terms without inventing fields', () => {
      const keys = parseRedemptionChecklist({
        validityType: 'birthday_entire_month',
        redemptionMethod: 'in-store',
        promoCode: 'BDAY10',
        termsAndConditions: 'בישיבה בלבד | אין כפל מבצעים | כרטיס מועדון',
      });
      expect(keys).toEqual(
        expect.arrayContaining(['inStore', 'code', 'noStacking', 'card'])
      );
      expect(keys).not.toContain('app');
    });

    it('maps app redemptionMethod', () => {
      expect(
        parseRedemptionChecklist({
          validityType: 'birthday_exact_date',
          redemptionMethod: 'app',
        })
      ).toEqual(['app']);
    });
  });

  describe('used-benefit next-year memory', () => {
    it('computes days until reopen after prior-year redemption', () => {
      const now = new Date(2026, 2, 1); // Mar 1 2026 — before Aug window
      const usedAt = new Date(2025, 7, 16); // redeemed Aug 2025
      const days = getDaysUntilReopens(
        { validityType: 'birthday_entire_month' },
        dob,
        usedAt,
        now
      );
      // Next window starts Aug 1 2026
      expect(days).toBe(
        Math.round(
          (new Date(2026, 7, 1).getTime() - new Date(2026, 2, 1).getTime()) /
            (24 * 60 * 60 * 1000)
        )
      );
      expect(
        wasRedeemedPreviousCycle(
          { validityType: 'birthday_entire_month' },
          dob,
          usedAt,
          now
        )
      ).toBe(true);
    });

    it('after marking used during open window, reopens next year', () => {
      const now = new Date(2026, 7, 20);
      const usedAt = new Date(2026, 7, 18);
      const days = getDaysUntilReopens(
        { validityType: 'birthday_entire_month' },
        dob,
        usedAt,
        now
      );
      expect(days).toBeGreaterThan(300);
      expect(
        wasRedeemedPreviousCycle(
          { validityType: 'birthday_entire_month' },
          dob,
          usedAt,
          now
        )
      ).toBe(false);
    });
  });
});
