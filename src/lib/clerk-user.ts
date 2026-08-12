import { prisma } from './prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function getOrCreateUser(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (user) return user;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim();

  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Only link legacy rows that have no Clerk owner yet.
      // Never overwrite an existing clerkId (account takeover).
      if (user.clerkId && user.clerkId !== clerkUserId) {
        throw new Error(
          `Email ${email} is already linked to a different Clerk account`
        );
      }
      if (!user.clerkId) {
        return prisma.user.update({
          where: { id: user.id },
          data: { clerkId: clerkUserId },
        });
      }
      return user;
    }
  }

  return prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email,
      name: name || null,
    },
  });
}
