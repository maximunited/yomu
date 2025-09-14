import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const benefit = await prisma.benefit.findUnique({
      where: { id },
      include: {
        brand: true,
        notifications: true,
      },
    });

    if (!benefit) {
      return NextResponse.json({ message: 'benefitNotFound' }, { status: 404 });
    }

    return NextResponse.json(benefit);
  } catch (error) {
    console.error('Error fetching benefit:', error);
    return NextResponse.json(
      { message: 'internalServerError' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;

    const updatedBenefit = await prisma.benefit.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        termsAndConditions: body.termsAndConditions,
        redemptionMethod: body.redemptionMethod,
        promoCode: body.promoCode,
        url: body.url,
        validityType: body.validityType,
        validityDuration: body.validityDuration,
        isFree: body.isFree,
        isActive: body.isActive,
        brandId: body.brandId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedBenefit);
  } catch (error) {
    console.error('Error updating benefit:', error);
    return NextResponse.json(
      { message: 'internalServerError' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete related notifications first
    await prisma.notification.deleteMany({
      where: { benefitId: id },
    });

    // Delete the benefit
    await prisma.benefit.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'benefitDeletedSuccessfully' });
  } catch (error) {
    console.error('Error deleting benefit:', error);
    return NextResponse.json(
      { message: 'internalServerError' },
      { status: 500 }
    );
  }
}
