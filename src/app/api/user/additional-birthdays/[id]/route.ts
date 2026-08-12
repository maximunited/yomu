import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

function parseDateOfBirth(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.additionalBirthday.findFirst({
      where: { id, userId: dbUser.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: 'additionalBirthdayNotFound' },
        { status: 404 }
      );
    }

    const data: { label?: string; dateOfBirth?: Date } = {};
    if (typeof body.label === 'string') {
      const label = body.label.trim();
      if (!label) {
        return NextResponse.json(
          { message: 'additionalBirthdayLabelRequired' },
          { status: 400 }
        );
      }
      data.label = label;
    }
    if (body.dateOfBirth !== undefined) {
      const dateOfBirth = parseDateOfBirth(body.dateOfBirth);
      if (!dateOfBirth) {
        return NextResponse.json(
          { message: 'additionalBirthdayDobRequired' },
          { status: 400 }
        );
      }
      data.dateOfBirth = dateOfBirth;
    }

    const updated = await prisma.additionalBirthday.update({
      where: { id },
      data,
      select: {
        id: true,
        label: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'additionalBirthdayUpdated',
      additionalBirthday: updated,
    });
  } catch (error) {
    console.error('Error updating additional birthday:', error);
    return NextResponse.json(
      {
        message: 'additionalBirthdayUpdateError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const { id } = await params;

    const existing = await prisma.additionalBirthday.findFirst({
      where: { id, userId: dbUser.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: 'additionalBirthdayNotFound' },
        { status: 404 }
      );
    }

    await prisma.additionalBirthday.delete({ where: { id } });

    return NextResponse.json({ message: 'additionalBirthdayDeleted' });
  } catch (error) {
    console.error('Error deleting additional birthday:', error);
    return NextResponse.json(
      {
        message: 'additionalBirthdayDeleteError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
