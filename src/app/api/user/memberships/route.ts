import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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

    // For now, we'll create mock brand records if they don't exist
    // In a real app, you'd have these pre-populated in the database
    const memberships = await Promise.all(
      brandIds.map(async (brandId) => {
        // Check if brand exists, if not create a mock one
        let brand = await prisma.brand.findFirst({
          where: { name: { contains: brandId } }
        });

        if (!brand) {
          // Create a mock brand for demo purposes
          brand = await prisma.brand.create({
            data: {
              name: brandId,
              logoUrl: `https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=${brandId.substring(0, 2).toUpperCase()}`,
              website: "https://example.com",
              category: "general",
            }
          });
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

    return NextResponse.json(
      { 
        message: "חברויות נשמרו בהצלחה",
        memberships: memberships.length 
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