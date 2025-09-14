import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== Starting GET request to /api/benefits ===');

    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');

    // For testing purposes, let's use a hardcoded user ID if session fails
    let userId = session?.user?.id;

    if (!userId) {
      console.log('No session user ID, using test user ID');
      // Get the first user from the database for testing
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        userId = testUser.id;
        console.log('Using test user ID:', userId);
      } else {
        console.log('No users found in database');
        return NextResponse.json(
          {
            message: 'unauthorized',
            error: 'AUTHENTICATION_REQUIRED',
          },
          { status: 401 }
        );
      }
    }

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
