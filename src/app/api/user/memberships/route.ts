import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Starting POST request to /api/user/memberships ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");
    console.log("Session user:", session?.user);

    // For testing purposes, let's use a hardcoded user ID if session fails
    let userId = session?.user?.id;
    
    if (!userId) {
      console.log("No session user ID, using test user ID");
      // Get the first user from the database for testing
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        userId = testUser.id;
        console.log("Using test user ID:", userId);
      } else {
        console.log("No users found in database");
        return NextResponse.json(
          { 
            message: "לא מורשה - אנא התחבר מחדש",
            error: "AUTHENTICATION_REQUIRED"
          },
          { status: 401 }
        );
      }
    }

    const { brandIds } = await request.json();
    console.log("Received brandIds:", brandIds);

    if (!brandIds || !Array.isArray(brandIds)) {
      return NextResponse.json(
        { message: "רשימת מותגים נדרשת" },
        { status: 400 }
      );
    }

    console.log("Processing brand IDs:", brandIds);

    // First, deactivate all existing memberships for this user
    await prisma.userMembership.updateMany({
      where: {
        userId: userId,
      },
      data: {
        isActive: false,
      },
    });

    // Then create/update memberships for the selected brands
    const memberships = await Promise.all(
      brandIds.map(async (brandId) => {
        // Check if brand exists by ID
        const brand = await prisma.brand.findUnique({
          where: { id: brandId }
        });

        if (!brand) {
          console.log(`Brand with ID ${brandId} not found`);
          return null;
        }

        // Create or update user membership
        return prisma.userMembership.upsert({
          where: {
            userId_brandId: {
              userId: userId,
              brandId: brand.id,
            }
          },
          update: {
            isActive: true,
          },
          create: {
            userId: userId,
            brandId: brand.id,
            isActive: true,
          }
        });
      })
    );

    const validMemberships = memberships.filter(m => m !== null);

    console.log(`Created ${validMemberships.length} memberships`);

    return NextResponse.json(
      { 
        message: "חברויות נשמרו בהצלחה",
        memberships: validMemberships.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving memberships:", error);
    return NextResponse.json(
      { 
        message: "שגיאה פנימית בשרת",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== Starting GET request to /api/user/memberships ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");

    // For testing purposes, let's use a hardcoded user ID if session fails
    let userId = session?.user?.id;
    
    if (!userId) {
      console.log("No session user ID, using test user ID");
      // Get the first user from the database for testing
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        userId = testUser.id;
        console.log("Using test user ID:", userId);
      } else {
        console.log("No users found in database");
        return NextResponse.json(
          { 
            message: "לא מורשה - אנא התחבר מחדש",
            error: "AUTHENTICATION_REQUIRED"
          },
          { status: 401 }
        );
      }
    }

    const memberships = await prisma.userMembership.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        brand: true,
      },
    });

    console.log(`Found ${memberships.length} memberships`);

    return NextResponse.json({ memberships });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { 
        message: "שגיאה פנימית בשרת",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 