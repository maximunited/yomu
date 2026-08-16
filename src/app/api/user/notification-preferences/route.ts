import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  sms: boolean;
  phoneNumber: string | null;
};

function serializePrefs(user: {
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
  phoneNumber: string | null;
}): NotificationPreferences {
  return {
    email: user.notifyEmail,
    push: user.notifyPush,
    sms: user.notifySms,
    phoneNumber: user.phoneNumber,
  };
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(clerkUserId);
    const user = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        notifyEmail: true,
        notifyPush: true,
        notifySms: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ preferences: serializePrefs(user) });
  } catch (error) {
    console.error('GET notification-preferences:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      phoneNumber?: string | null;
    };

    const data: {
      notifyEmail?: boolean;
      notifyPush?: boolean;
      notifySms?: boolean;
      phoneNumber?: string | null;
    } = {};

    if (typeof body.email === 'boolean') data.notifyEmail = body.email;
    if (typeof body.push === 'boolean') data.notifyPush = body.push;
    if (typeof body.sms === 'boolean') data.notifySms = body.sms;
    if (body.phoneNumber !== undefined) {
      const trimmed =
        typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
      data.phoneNumber = trimmed.length > 0 ? trimmed : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(clerkUserId);
    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data,
      select: {
        notifyEmail: true,
        notifyPush: true,
        notifySms: true,
        phoneNumber: true,
      },
    });

    return NextResponse.json({ preferences: serializePrefs(updated) });
  } catch (error) {
    console.error('PATCH notification-preferences:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
