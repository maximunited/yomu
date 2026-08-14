import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import {
  notificationInclude,
  serializeNotification,
} from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const rows = await prisma.notification.findMany({
      where: { userId: user.id },
      include: notificationInclude,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      notifications: rows.map(serializeNotification),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { markAllRead?: boolean };
    if (body.markAllRead !== true) {
      return NextResponse.json(
        { error: 'markAllRead: true is required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
