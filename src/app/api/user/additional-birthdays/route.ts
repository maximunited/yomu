import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

function parseDateOfBirth(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);

    const additionalBirthdays = await prisma.additionalBirthday.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        label: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ additionalBirthdays });
  } catch (error) {
    console.error('Error fetching additional birthdays:', error);
    return NextResponse.json(
      {
        message: 'additionalBirthdaysLoadError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const body = await request.json();
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const dateOfBirth = parseDateOfBirth(body.dateOfBirth);

    if (!label) {
      return NextResponse.json(
        { message: 'additionalBirthdayLabelRequired' },
        { status: 400 }
      );
    }
    if (!dateOfBirth) {
      return NextResponse.json(
        { message: 'additionalBirthdayDobRequired' },
        { status: 400 }
      );
    }

    const existingCount = await prisma.additionalBirthday.count({
      where: { userId: dbUser.id },
    });
    if (existingCount >= 10) {
      return NextResponse.json(
        { message: 'additionalBirthdayLimitReached' },
        { status: 400 }
      );
    }

    const created = await prisma.additionalBirthday.create({
      data: {
        userId: dbUser.id,
        label,
        dateOfBirth,
      },
      select: {
        id: true,
        label: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: 'additionalBirthdayCreated', additionalBirthday: created },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating additional birthday:', error);
    return NextResponse.json(
      {
        message: 'additionalBirthdayCreateError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
