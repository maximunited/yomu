import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "לא מורשה" },
        { status: 401 }
      );
    }

    // Get user's memberships
    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: session.user.id,
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
          },
        },
      },
    });

    // Transform benefits to match the expected format
    const transformedBenefits = benefits.map(benefit => ({
      id: benefit.id,
      title: benefit.title,
      description: benefit.description,
      brandId: benefit.brandId,
      brand: {
        name: benefit.brand.name,
        logoUrl: benefit.brand.logoUrl,
        website: benefit.brand.website,
      },
      promoCode: benefit.promoCode,
      url: benefit.brand.website,
      validityType: benefit.validityType || "birthday_month",
      validityDuration: benefit.validityDuration,
      redemptionMethod: benefit.redemptionMethod,
      termsAndConditions: benefit.termsAndConditions,
    }));

    return NextResponse.json({
      benefits: transformedBenefits,
      memberships: userMemberships.length
    });
  } catch (error) {
    console.error("Error fetching benefits:", error);
    return NextResponse.json(
      { message: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
} 