import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== Starting GET request to /api/benefits ===');

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const userId = dbUser.id;

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

    // Transform benefits to match the expected format
    const transformedBenefits = benefits.map((benefit) => ({
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
      url: benefit.brand.website,
      validityType: benefit.validityType || 'birthday_month',
      validityDuration: benefit.validityDuration,
      redemptionMethod: benefit.redemptionMethod,
      termsAndConditions: benefit.termsAndConditions,
      isFree: benefit.isFree,
      createdAt: benefit.createdAt,
      updatedAt: benefit.updatedAt,
    }));

    return NextResponse.json({
      benefits: transformedBenefits,
      memberships: userMemberships.length,
    });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return NextResponse.json(
      { message: 'internalServerError' },
      { status: 500 }
    );
  }
}
