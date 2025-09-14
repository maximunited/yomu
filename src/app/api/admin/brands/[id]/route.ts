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
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        benefits: true,
        partnershipsTo: {
          include: { brandA: true },
        },
        partnershipsFrom: {
          include: { brandB: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ message: 'benefitNotFound' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
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

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        website: body.website,
        description: body.description,
        category: body.category,
        actionUrl: body.actionUrl,
        actionType: body.actionType,
        actionLabel: body.actionLabel,
        isActive: body.isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
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

    // Delete related records first
    await prisma.benefit.deleteMany({
      where: { brandId: id },
    });

    await prisma.brandPartnership.deleteMany({
      where: {
        OR: [{ brandAId: id }, { brandBId: id }],
      },
    });

    await prisma.userMembership.deleteMany({
      where: { brandId: id },
    });

    // Delete the brand
    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'brandDeletedSuccessfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { message: 'internalServerError' },
      { status: 500 }
    );
  }
}
