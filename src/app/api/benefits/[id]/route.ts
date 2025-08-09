import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const benefitId = id;
    
    const benefit = await prisma.benefit.findUnique({
      where: {
        id: benefitId,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            description: true,
            category: true,
          },
        },
      },
    });

    if (!benefit) {
      return NextResponse.json(
        { message: "benefitNotFound" },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const transformedBenefit = {
      id: benefit.id,
      title: benefit.title,
      description: benefit.description,
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
    };

    return NextResponse.json(transformedBenefit);
  } catch (error) {
    console.error("Error fetching benefit:", error);
    return NextResponse.json(
      { message: "internalServerError" },
      { status: 500 }
    );
  }
} 