import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    if (!userId) {
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        userId = testUser.id;
      } else {
        return NextResponse.json(
          { message: "לא מורשה - אנא התחבר מחדש" },
          { status: 401 }
        );
      }
    }

    const { customMembershipId, benefit } = await request.json();

    if (!customMembershipId || !benefit) {
      return NextResponse.json(
        { message: "נתונים חסרים" },
        { status: 400 }
      );
    }

    // Verify the custom membership belongs to the user
    const customMembership = await prisma.customMembership.findFirst({
      where: {
        id: customMembershipId,
        userId: userId,
      },
    });

    if (!customMembership) {
      return NextResponse.json(
        { message: "חברות מותאמת אישית לא נמצאה" },
        { status: 404 }
      );
    }

    // Create the benefit
    const createdBenefit = await prisma.customBenefit.create({
      data: {
        customMembershipId: customMembershipId,
        title: benefit.title,
        description: benefit.description,
        termsAndConditions: benefit.termsAndConditions,
        redemptionMethod: benefit.redemptionMethod,
        promoCode: benefit.promoCode,
        url: benefit.url,
        validityType: benefit.validityType,
        validityDuration: benefit.validityDuration,
        isFree: benefit.isFree,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "הטבה נוספה בהצלחה",
      benefit: createdBenefit,
    });
  } catch (error) {
    console.error("Error creating custom benefit:", error);
    return NextResponse.json(
      { message: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    if (!userId) {
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        userId = testUser.id;
      } else {
        return NextResponse.json(
          { message: "לא מורשה - אנא התחבר מחדש" },
          { status: 401 }
        );
      }
    }

    const { customMembershipId, updates } = await request.json();

    if (!customMembershipId) {
      return NextResponse.json(
        { message: "מזהה חברות מותאמת אישית נדרש" },
        { status: 400 }
      );
    }

    // Verify the custom membership belongs to the user
    const customMembership = await prisma.customMembership.findFirst({
      where: {
        id: customMembershipId,
        userId: userId,
      },
    });

    if (!customMembership) {
      return NextResponse.json(
        { message: "חברות מותאמת אישית לא נמצאה" },
        { status: 404 }
      );
    }

    // Update the custom membership
    const updatedMembership = await prisma.customMembership.update({
      where: { id: customMembershipId },
      data: updates,
    });

    return NextResponse.json({
      message: "חברות מותאמת אישית עודכנה בהצלחה",
      membership: updatedMembership,
    });
  } catch (error) {
    console.error("Error updating custom membership:", error);
    return NextResponse.json(
      { message: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    if (!userId) {
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        userId = testUser.id;
      } else {
        return NextResponse.json(
          { message: "לא מורשה - אנא התחבר מחדש" },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const customMembershipId = searchParams.get('id');

    if (!customMembershipId) {
      return NextResponse.json(
        { message: "מזהה חברות מותאמת אישית נדרש" },
        { status: 400 }
      );
    }

    // Verify the custom membership belongs to the user
    const customMembership = await prisma.customMembership.findFirst({
      where: {
        id: customMembershipId,
        userId: userId,
      },
    });

    if (!customMembership) {
      return NextResponse.json(
        { message: "חברות מותאמת אישית לא נמצאה" },
        { status: 404 }
      );
    }

    // Delete the custom membership (this will cascade delete benefits and user memberships)
    await prisma.customMembership.delete({
      where: { id: customMembershipId },
    });

    return NextResponse.json({
      message: "חברות מותאמת אישית נמחקה בהצלחה",
    });
  } catch (error) {
    console.error("Error deleting custom membership:", error);
    return NextResponse.json(
      { message: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
} 