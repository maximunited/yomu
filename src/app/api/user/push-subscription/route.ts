import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      endpoint?: string;
      p256dh?: string;
      auth?: string;
    };

    if (!body.endpoint || !body.p256dh || !body.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    const dbUser = await getOrCreateUser(clerkUserId);

    await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: {
        userId: dbUser.id,
        endpoint: body.endpoint,
        p256dh: body.p256dh,
        auth: body.auth,
      },
      update: {
        userId: dbUser.id,
        p256dh: body.p256dh,
        auth: body.auth,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST push-subscription:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { endpoint?: string };
    if (!body.endpoint) {
      return NextResponse.json({ error: 'endpoint required' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(clerkUserId);

    await prisma.pushSubscription.deleteMany({
      where: { userId: dbUser.id, endpoint: body.endpoint },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE push-subscription:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
