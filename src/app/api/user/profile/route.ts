import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

/** Empty string / null clears anniversary; omitted leaves unchanged. */
function resolveAnniversaryUpdate(
  anniversaryDate: unknown
): Date | null | undefined {
  if (anniversaryDate === undefined) return undefined;
  if (anniversaryDate === null || anniversaryDate === '') return null;
  if (typeof anniversaryDate === 'string') {
    const d = new Date(anniversaryDate);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== Starting PUT request to /api/user/profile ===');

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const userId = dbUser.id;

    const body = await request.json();
    const { name, dateOfBirth, anniversaryDate, profilePicture } = body;

    console.log('Updating profile for user:', userId);
    console.log('Profile data:', {
      name,
      dateOfBirth,
      anniversaryDate,
      profilePicture: profilePicture ? 'present' : 'not present',
    });

    const anniversaryUpdate = resolveAnniversaryUpdate(anniversaryDate);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        ...(anniversaryUpdate !== undefined
          ? { anniversaryDate: anniversaryUpdate }
          : {}),
        profilePicture: profilePicture || undefined,
      },
    });

    console.log('Profile updated successfully');

    return NextResponse.json({
      message: 'profileUpdatedSuccessfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        dateOfBirth: updatedUser.dateOfBirth,
        anniversaryDate: updatedUser.anniversaryDate,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        message: 'profileUpdateError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== Starting GET request to /api/user/profile ===');

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await getOrCreateUser(clerkUserId);
    const userId = dbUser.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        dateOfBirth: true,
        anniversaryDate: true,
        profilePicture: true,
        additionalBirthdays: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            label: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'userNotFound' }, { status: 404 });
    }

    console.log('Profile loaded successfully');

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        message: 'profileLoadError',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
