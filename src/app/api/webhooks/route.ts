import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  captureException,
  captureMessage,
  hashEmailPrefix,
} from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (error) {
    await captureException(error, {
      tags: { area: 'clerk-webhook', stage: 'verify' },
    });
    return new Response('Verification failed', { status: 400 });
  }

  try {
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

      if (email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          // Only link when unclaimed — never rebind another Clerk account
          if (existingUser.clerkId && existingUser.clerkId !== id) {
            const msg =
              'Webhook user.created: duplicate email link refused';
            console.error(msg, {
              emailHash: hashEmailPrefix(email),
              existingClerkId: existingUser.clerkId,
              refusedClerkId: id,
            });
            await captureMessage(msg, {
              tags: {
                area: 'clerk-webhook',
                stage: 'user.created',
                reason: 'duplicate-email',
              },
              level: 'warning',
              extra: {
                emailHash: hashEmailPrefix(email),
                existingClerkId: existingUser.clerkId,
                refusedClerkId: id,
              },
            });
            return new Response('Email already linked', { status: 409 });
          }
          if (!existingUser.clerkId) {
            await prisma.user.update({
              where: { email },
              data: { clerkId: id, name: name || existingUser.name },
            });
          }
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
  } catch (error) {
    console.error('Webhook handler failed:', error);
    await captureException(error, {
      tags: { area: 'clerk-webhook', stage: evt.type },
    });
    return new Response('Webhook handler failed', { status: 500 });
  }
}
