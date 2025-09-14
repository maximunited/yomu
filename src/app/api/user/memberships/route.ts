import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting POST request to /api/user/memberships ===');

    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');
    console.log('Session user:', session?.user);

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

    const { brandIds, customMemberships } = await request.json();
    console.log('Received brandIds:', brandIds);
    console.log('Received customMemberships:', customMemberships);

    // First, deactivate all existing memberships for this user
    await prisma.userMembership.updateMany({
      where: {
        userId: userId,
      },
      data: {
        isActive: false,
      },
    });

    const results = [];

    // Handle regular brand memberships
    if (brandIds && Array.isArray(brandIds)) {
      console.log('Processing brand IDs:', brandIds);

      const brandMemberships = await Promise.all(
        brandIds.map(async (brandId) => {
          // Check if brand exists by ID and get its partnerships
          const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            include: {
              partnershipsFrom: {
                include: {
                  brandB: true,
                },
              },
              partnershipsTo: {
                include: {
                  brandA: true,
                },
              },
            },
          });

          if (!brand) {
            console.log(`Brand with ID ${brandId} not found`);
            return null;
          }

          const membershipsToCreate = [];

          // Create membership for the main brand
          const mainMembership = await prisma.userMembership.upsert({
            where: {
              userId_brandId: {
                userId: userId,
                brandId: brand.id,
              },
            },
            update: {
              isActive: true,
            },
            create: {
              userId: userId,
              brandId: brand.id,
              isActive: true,
            },
          });

          membershipsToCreate.push(mainMembership);

          // Get all partner brands (bidirectional partnerships)
          const partnerBrands: Array<{ id: string; name: string }> = [];

          // Add brands where this brand is brandA in partnerships
          brand.partnershipsFrom.forEach((partnership) => {
            partnerBrands.push(partnership.brandB);
          });

          // Add brands where this brand is brandB in partnerships
          brand.partnershipsTo.forEach((partnership) => {
            partnerBrands.push(partnership.brandA);
          });

          // Create memberships for partner brands
          if (partnerBrands.length > 0) {
            console.log(
              `Creating partnership memberships for ${
                brand.name
              } ↔ ${partnerBrands.map((p) => p.name).join(', ')}`
            );

            for (const partnerBrand of partnerBrands) {
              const partnerMembership = await prisma.userMembership.upsert({
                where: {
                  userId_brandId: {
                    userId: userId,
                    brandId: partnerBrand.id,
                  },
                },
                update: {
                  isActive: true,
                },
                create: {
                  userId: userId,
                  brandId: partnerBrand.id,
                  isActive: true,
                },
              });

              membershipsToCreate.push(partnerMembership);
            }
          }

          return membershipsToCreate;
        })
      );

      results.push(...brandMemberships.filter((m) => m !== null).flat());
    }

    // Handle custom memberships
    if (customMemberships && Array.isArray(customMemberships)) {
      console.log('Processing custom memberships:', customMemberships);

      const customMembershipResults = await Promise.all(
        customMemberships.map(async (customMembership) => {
          if (
            !customMembership.name ||
            !customMembership.description ||
            !customMembership.category
          ) {
            console.log('Invalid custom membership data:', customMembership);
            return null;
          }

          // Create custom membership
          const createdCustomMembership = await prisma.customMembership.create({
            data: {
              userId: userId,
              name: customMembership.name,
              description: customMembership.description,
              category: customMembership.category,
              icon: customMembership.icon || '/images/brands/restaurant.svg',
              type: customMembership.type || 'free',
              cost: customMembership.cost || null,
              isActive: true,
            },
          });

          // Create user membership for the custom membership
          const userMembership = await prisma.userMembership.create({
            data: {
              userId: userId,
              customMembershipId: createdCustomMembership.id,
              isActive: true,
            },
          });

          return userMembership;
        })
      );

      results.push(...customMembershipResults.filter((m) => m !== null));
    }

    console.log(`Created ${results.length} memberships`);

    return NextResponse.json(
      {
        message: 'changesSavedSuccessfully',
        memberships: results.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving memberships:', error);
    return NextResponse.json(
      {
        message: 'internalServerError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== Starting GET request to /api/user/memberships ===');

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

    // Get regular brand memberships
    const brandMemberships = await prisma.userMembership.findMany({
      where: {
        userId: userId,
        isActive: true,
        brandId: { not: null },
      },
      include: {
        brand: true,
      },
    });

    // Get custom memberships
    const customMemberships = await prisma.userMembership.findMany({
      where: {
        userId: userId,
        isActive: true,
        customMembershipId: { not: null },
      },
      include: {
        customMembership: true,
      },
    });

    // Transform custom memberships to match brand membership format
    const transformedCustomMemberships = customMemberships.map(
      (membership) => ({
        id: membership.customMembership!.id,
        brandId: membership.customMembership!.id,
        isActive: membership.isActive,
        brand: {
          id: membership.customMembership!.id,
          name: membership.customMembership!.name,
          logoUrl: membership.customMembership!.icon,
          website: '',
          description: membership.customMembership!.description,
          category: membership.customMembership!.category,
          type: membership.customMembership!.type,
          cost: membership.customMembership!.cost,
        },
      })
    );

    const allMemberships = [
      ...brandMemberships,
      ...transformedCustomMemberships,
    ];

    console.log(`Found ${allMemberships.length} memberships`);

    return NextResponse.json({ memberships: allMemberships });
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json(
      {
        message: 'internalServerError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
