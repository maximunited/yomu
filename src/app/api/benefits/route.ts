import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';
import {
  isBenefitAsOfQueryAllowed,
  parseAsOfDate,
  withBenefitWindowStatus,
  getBenefitNow,
  getCalendarDayInTimeZone,
  resolveBenefitTimeZone,
} from '@/lib/benefit-validation';

export async function GET(request?: NextRequest) {
  try {
    console.log('=== Starting GET request to /api/benefits ===');

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const userId = dbUser.id;

    const asOfParam = request?.nextUrl?.searchParams?.get('asOf') ?? null;
    const asOf =
      isBenefitAsOfQueryAllowed() && asOfParam
        ? parseAsOfDate(asOfParam)
        : null;
    const tzParam =
      request?.nextUrl?.searchParams?.get('tz') ??
      request?.headers?.get('time-zone') ??
      null;
    const timeZone = resolveBenefitTimeZone(tzParam);
    // Prefer explicit asOf; otherwise “today” in product/allowlisted TZ (not host UTC).
    const evaluatedAt =
      asOf ?? getCalendarDayInTimeZone(getBenefitNow(), timeZone);

    const userDOB = dbUser.dateOfBirth ? new Date(dbUser.dateOfBirth) : null;

    // Get user's memberships
    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        brand: {
          include: {
            benefits: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    // Load all benefits from database
    const benefits = await prisma.benefit.findMany({
      where: {
        isActive: true,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            category: true,
            actionUrl: true,
            actionType: true,
            actionLabel: true,
          },
        },
      },
    });

    // Transform benefits; attach server-computed Active/Upcoming window
    const transformedBenefits = benefits.map((benefit) => {
      const base = {
        id: benefit.id,
        title: benefit.title,
        description: benefit.description,
        brandId: benefit.brandId,
        brand: {
          name: benefit.brand.name,
          logoUrl: benefit.brand.logoUrl,
          website: benefit.brand.website,
          category: benefit.brand.category,
          actionUrl: benefit.brand.actionUrl,
          actionType: benefit.brand.actionType,
          actionLabel: benefit.brand.actionLabel,
        },
        promoCode: benefit.promoCode,
        url: benefit.url ?? benefit.brand.website,
        validityType: benefit.validityType || 'birthday_month',
        validityDuration: benefit.validityDuration,
        redemptionMethod: benefit.redemptionMethod,
        termsAndConditions: benefit.termsAndConditions,
        termsUrl: benefit.termsUrl,
        isFree: benefit.isFree,
        verified: benefit.verified,
        lastChecked: benefit.lastChecked,
        createdAt: benefit.createdAt,
        updatedAt: benefit.updatedAt,
      };

      return withBenefitWindowStatus(base, userDOB, evaluatedAt);
    });

    return NextResponse.json({
      benefits: transformedBenefits,
      memberships: userMemberships.length,
      evaluatedAt: evaluatedAt.toISOString(),
      timeZone,
    });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return NextResponse.json(
      { message: 'internalServerError' },
      { status: 500 }
    );
  }
}
