import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response('Verification failed', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        await prisma.user.update({
          where: { email },
          data: { clerkId: id, name: name || existingUser.name },
        });
        return new Response('OK', { status: 200 });
      }
    }

    await prisma.user.create({
      data: { clerkId: id, email, name: name || null },
    });
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

    await prisma.user.updateMany({
      where: { clerkId: id },
      data: { email, name: name || undefined },
    });
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await prisma.user.deleteMany({ where: { clerkId: id } });
    }
  }

  return new Response('OK', { status: 200 });
}
