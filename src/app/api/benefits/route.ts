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

    // For demo purposes, return mock benefits
    // In a real app, you'd filter benefits based on user's birthday and memberships
    const mockBenefits = [
      {
        id: "1",
        title: "30% הנחה על כל הקנייה",
        description: "הטבה מיוחדת ליום הולדת - 30% הנחה על כל הקנייה בחנות",
        brand: {
          name: "Fox",
          logoUrl: "/images/brands/fox.png"
        },
        promoCode: "BDAY30",
        url: "https://fox.co.il",
        validityType: "birthday_month",
        redemptionMethod: "קוד קופון",
        termsAndConditions: "הטבה תקפה לחודש יום ההולדת בלבד"
      },
      {
        id: "2",
        title: "קפה חינם",
        description: "קפה חינם ביום ההולדת שלך",
        brand: {
          name: "Starbucks",
          logoUrl: "/images/brands/starbucks.png"
        },
        validityType: "birthday_date",
        redemptionMethod: "אוטומטי באפליקציה",
        termsAndConditions: "תקף ביום ההולדת בלבד"
      },
      {
        id: "3",
        title: "הנחה של 50 ₪",
        description: "הנחה של 50 ₪ על קנייה מעל 200 ₪",
        brand: {
          name: "Super-Pharm",
          logoUrl: "/images/brands/super-pharm.png"
        },
        promoCode: "BDAY50",
        url: "https://super-pharm.co.il",
        validityType: "birthday_month",
        redemptionMethod: "קוד קופון",
        termsAndConditions: "תקף לחודש יום ההולדת"
      }
    ];

    return NextResponse.json({
      benefits: mockBenefits,
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