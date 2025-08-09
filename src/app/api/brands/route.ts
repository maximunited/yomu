import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      include: {
        partnershipsFrom: {
          include: {
            brandB: true
          }
        },
        partnershipsTo: {
          include: {
            brandA: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform brands to include partner brands in a usable format
    const transformedBrands = brands.map(brand => {
      const partnerBrands = [];
      
      // Add partners where this brand is brandA
      brand.partnershipsFrom.forEach(partnership => {
        if (partnership.brandB && partnership.brandB.isActive) {
          partnerBrands.push(partnership.brandB);
        }
      });
      
      // Add partners where this brand is brandB
      brand.partnershipsTo.forEach(partnership => {
        if (partnership.brandA && partnership.brandA.isActive) {
          partnerBrands.push(partnership.brandA);
        }
      });

      return {
        ...brand,
        partnerBrands,
        // Keep old field names for backward compatibility during transition
        childBrands: partnerBrands,
        parentBrand: null
      };
    });

    return NextResponse.json(transformedBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
  return NextResponse.json(
    { message: "internalServerError" },
    { status: 500 }
  );
  }
} 