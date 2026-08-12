export type AdditionalBirthdayRef = {
  id: string;
  dateOfBirth: string | Date;
};

/**
 * Resolve DOB + anniversary for dashboard benefit filtering.
 * Stale/missing selectedProfileId falls back to self fully (including anniversary).
 */
export function resolveSelectedBenefitDates({
  selectedProfileId,
  userDOB,
  anniversaryDate,
  additionalBirthdays,
}: {
  selectedProfileId: string;
  userDOB: Date | null;
  anniversaryDate: Date | null;
  additionalBirthdays: AdditionalBirthdayRef[];
}): {
  dateOfBirth: Date | null;
  anniversaryDate: Date | null;
  effectiveProfileId: string;
} {
  if (selectedProfileId === 'self') {
    return {
      dateOfBirth: userDOB,
      anniversaryDate,
      effectiveProfileId: 'self',
    };
  }

  const match = additionalBirthdays.find((b) => b.id === selectedProfileId);
  if (!match) {
    return {
      dateOfBirth: userDOB,
      anniversaryDate,
      effectiveProfileId: 'self',
    };
  }

  return {
    dateOfBirth: new Date(match.dateOfBirth),
    anniversaryDate: null,
    effectiveProfileId: selectedProfileId,
  };
}
