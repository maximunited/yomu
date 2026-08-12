import { resolveSelectedBenefitDates } from '@/lib/family-profile-context';

describe('resolveSelectedBenefitDates', () => {
  const userDOB = new Date('1990-07-02');
  const anniversaryDate = new Date('2015-03-10');
  const extras = [
    { id: 'kid-1', dateOfBirth: '2018-01-15' },
    { id: 'spouse-1', dateOfBirth: '1992-08-20' },
  ];

  it('uses self DOB + anniversary for self profile', () => {
    expect(
      resolveSelectedBenefitDates({
        selectedProfileId: 'self',
        userDOB,
        anniversaryDate,
        additionalBirthdays: extras,
      })
    ).toEqual({
      dateOfBirth: userDOB,
      anniversaryDate,
      effectiveProfileId: 'self',
    });
  });

  it('uses family DOB and clears anniversary for a known extra profile', () => {
    const result = resolveSelectedBenefitDates({
      selectedProfileId: 'kid-1',
      userDOB,
      anniversaryDate,
      additionalBirthdays: extras,
    });
    expect(result.effectiveProfileId).toBe('kid-1');
    expect(result.anniversaryDate).toBeNull();
    expect(result.dateOfBirth).toEqual(new Date('2018-01-15'));
  });

  it('falls back to full self context when selectedProfileId is missing', () => {
    expect(
      resolveSelectedBenefitDates({
        selectedProfileId: 'deleted-ghost-id',
        userDOB,
        anniversaryDate,
        additionalBirthdays: extras,
      })
    ).toEqual({
      dateOfBirth: userDOB,
      anniversaryDate,
      effectiveProfileId: 'self',
    });
  });

  it('falls back to self when additionalBirthdays is empty', () => {
    expect(
      resolveSelectedBenefitDates({
        selectedProfileId: 'kid-1',
        userDOB,
        anniversaryDate,
        additionalBirthdays: [],
      })
    ).toEqual({
      dateOfBirth: userDOB,
      anniversaryDate,
      effectiveProfileId: 'self',
    });
  });
});
