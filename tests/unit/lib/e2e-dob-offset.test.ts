import {
  GOLDEN_PATH_DOB_OFFSET_DAYS,
  dateOfBirthDaysFromToday,
  localNoonDate,
} from '../../../tests/e2e/helpers/dob';
import { isBenefitActive, getUpcomingBenefits } from '@/lib/benefit-validation';

describe('e2e DOB offset helper (benefit golden path)', () => {
  const now = localNoonDate(2026, 7, 12); // 12 Aug 2026 local noon

  it('builds DOB offset from local calendar day at noon', () => {
    const dob = dateOfBirthDaysFromToday(GOLDEN_PATH_DOB_OFFSET_DAYS, now);
    expect(dob.getFullYear()).toBe(2026);
    expect(dob.getMonth()).toBe(7);
    expect(dob.getDate()).toBe(22);
    expect(dob.getHours()).toBe(12);
  });

  it('makes birthday_30_days Active and birthday_exact_date Upcoming', () => {
    const dob = dateOfBirthDaysFromToday(GOLDEN_PATH_DOB_OFFSET_DAYS, now);

    expect(
      isBenefitActive({ validityType: 'birthday_30_days' }, dob, now)
    ).toBe(true);
    expect(
      isBenefitActive({ validityType: 'birthday_exact_date' }, dob, now)
    ).toBe(false);
    expect(
      getUpcomingBenefits({ validityType: 'birthday_exact_date' }, dob, now)
    ).toBe(true);
    expect(
      getUpcomingBenefits({ validityType: 'birthday_30_days' }, dob, now)
    ).toBe(false);
  });

  it('supports negative offsets (birthday in the past)', () => {
    const dob = dateOfBirthDaysFromToday(-3, now);
    expect(dob.getFullYear()).toBe(2026);
    expect(dob.getMonth()).toBe(7);
    expect(dob.getDate()).toBe(9);
  });
});
