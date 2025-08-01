import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json(
        { message: "לא מורשה" },
        { status: 401 }
      );
    }

    const { brandIds } = await request.json();

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
        userId: session.user.id,
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
              userId: session.user.id,
              brandId: brand.id,
            }
          },
          update: {
            isActive: true,
          },
          create: {
            userId: session.user.id,
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
      { message: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "לא מורשה" },
        { status: 401 }
      );
    }

    const memberships = await prisma.userMembership.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        brand: true,
      },
    });

    return NextResponse.json({ memberships });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { message: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
} 