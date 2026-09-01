import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    // Return all benefits for admin (including inactive)
    const benefits = await prisma.benefit.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(benefits);
  } catch (error) {
    console.error('Error listing benefits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const body = await request.json();

    const newBenefit = await prisma.benefit.create({
      data: {
        brandId: body.brandId,
        title: body.title,
        description: body.description,
        termsAndConditions: body.termsAndConditions,
        termsUrl: body.termsUrl,
        redemptionMethod: body.redemptionMethod,
        promoCode: body.promoCode,
        url: body.url,
        validityType: body.validityType,
        validityDuration: body.validityDuration,
        isFree: body.isFree ?? true,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(newBenefit, { status: 201 });
  } catch (error) {
    console.error('Error creating benefit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
