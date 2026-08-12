import { disconnectE2EPrisma, getE2EPrisma } from './prisma-e2e';

/** Stable names so the golden-path spec can assert without brittle IDs. */
export const GOLDEN_BRAND_ACTIVE = 'E2E Golden Active';
export const GOLDEN_BRAND_UPCOMING = 'E2E Golden Upcoming';
export const GOLDEN_BENEFIT_ACTIVE_TITLE = 'E2E Active Window Benefit';
export const GOLDEN_BENEFIT_UPCOMING_TITLE = 'E2E Upcoming Exact Benefit';

const PLACEHOLDER_LOGO = '/images/brands/restaurant.svg';

/**
 * Seed two membership brands for the e2e user:
 * - Active brand: `birthday_30_days` (active when DOB is ~10 days ahead)
 * - Upcoming brand: `birthday_exact_date` (upcoming until the birthday day)
 *
 * Also resets remindEnabled=true on the upcoming membership for reminder tests.
 */
export async function seedBenefitGoldenPath(userId: string): Promise<{
  activeBrandId: string;
  upcomingBrandId: string;
  activeBenefitId: string;
  upcomingBenefitId: string;
}> {
  if (!userId?.trim()) {
    throw new Error('seedBenefitGoldenPath: userId is required');
  }

  const prisma = getE2EPrisma();

  try {
    const activeBrand = await upsertBrand({
      name: GOLDEN_BRAND_ACTIVE,
      description: 'E2E fixture — active birthday window (±30 days)',
    });
    const upcomingBrand = await upsertBrand({
      name: GOLDEN_BRAND_UPCOMING,
      description: 'E2E fixture — exact-date benefit (upcoming)',
    });

    const activeBenefit = await upsertBenefit({
      brandId: activeBrand.id,
      title: GOLDEN_BENEFIT_ACTIVE_TITLE,
      description: 'Should appear under Active Now for the golden-path DOB',
      validityType: 'birthday_30_days',
      validityDuration: 60,
    });
    const upcomingBenefit = await upsertBenefit({
      brandId: upcomingBrand.id,
      title: GOLDEN_BENEFIT_UPCOMING_TITLE,
      description: 'Should appear under Coming Soon for the golden-path DOB',
      validityType: 'birthday_exact_date',
      validityDuration: 1,
    });

    await upsertMembership(userId, activeBrand.id, true);
    await upsertMembership(userId, upcomingBrand.id, true);

    return {
      activeBrandId: activeBrand.id,
      upcomingBrandId: upcomingBrand.id,
      activeBenefitId: activeBenefit.id,
      upcomingBenefitId: upcomingBenefit.id,
    };
  } catch (err) {
    throw new Error(
      `Failed to seed benefit golden path: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

async function upsertBrand(input: {
  name: string;
  description: string;
}): Promise<{ id: string }> {
  const prisma = getE2EPrisma();
  const existing = await prisma.brand.findMany({
    where: { name: input.name },
    orderBy: { createdAt: 'asc' },
  });
  // Parallel e2e workers may have created duplicates — keep oldest, drop rest
  if (existing.length > 1) {
    const [, ...dupes] = existing;
    await prisma.brand.deleteMany({
      where: { id: { in: dupes.map((b) => b.id) } },
    });
  }
  const keep = existing[0];
  if (keep) {
    return prisma.brand.update({
      where: { id: keep.id },
      data: {
        description: input.description,
        logoUrl: PLACEHOLDER_LOGO,
        website: 'https://example.com/e2e-golden',
        category: 'food',
        isActive: true,
        actionLabel: 'E2E',
      },
      select: { id: true },
    });
  }
  return prisma.brand.create({
    data: {
      name: input.name,
      description: input.description,
      logoUrl: PLACEHOLDER_LOGO,
      website: 'https://example.com/e2e-golden',
      category: 'food',
      isActive: true,
      actionLabel: 'E2E',
    },
    select: { id: true },
  });
}

async function upsertBenefit(input: {
  brandId: string;
  title: string;
  description: string;
  validityType: string;
  validityDuration: number;
}): Promise<{ id: string }> {
  const prisma = getE2EPrisma();
  const existing = await prisma.benefit.findFirst({
    where: { brandId: input.brandId, title: input.title },
  });
  const data = {
    description: input.description,
    termsAndConditions: 'E2E fixture only — not a real brand benefit',
    redemptionMethod: 'show-app',
    validityType: input.validityType,
    validityDuration: input.validityDuration,
    isFree: true,
    isActive: true,
    // Never publish e2e fixtures as verified catalog entries
    verified: false,
    lastChecked: null,
  };
  if (existing) {
    return prisma.benefit.update({
      where: { id: existing.id },
      data,
      select: { id: true },
    });
  }
  return prisma.benefit.create({
    data: {
      brandId: input.brandId,
      title: input.title,
      ...data,
    },
    select: { id: true },
  });
}

async function upsertMembership(
  userId: string,
  brandId: string,
  remindEnabled: boolean
): Promise<void> {
  const prisma = getE2EPrisma();
  await prisma.userMembership.upsert({
    where: {
      userId_brandId: { userId, brandId },
    },
    create: {
      userId,
      brandId,
      isActive: true,
      remindEnabled,
    },
    update: {
      isActive: true,
      remindEnabled,
    },
  });
}

export { disconnectE2EPrisma };
