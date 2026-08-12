import { GOLDEN_PATH_DOB_OFFSET_DAYS, dateOfBirthDaysFromToday } from './dob';
import { disconnectE2EPrisma, getE2EPrisma } from './prisma-e2e';

export type SeedE2EUserInput = {
  clerkId: string;
  email: string;
  name?: string;
  /** Defaults to golden-path offset (birthday in 10 days). */
  dateOfBirth?: Date;
};

/**
 * Upsert the Clerk e2e user into Prisma with a known DOB.
 * Hard-fails on missing DB URL, missing clerkId/email, or Prisma errors.
 */
export async function seedE2EUserWithDOB(
  input: SeedE2EUserInput
): Promise<{ id: string; dateOfBirth: Date }> {
  const { clerkId, email } = input;
  if (!clerkId?.trim()) {
    throw new Error('seedE2EUserWithDOB: clerkId is required');
  }
  if (!email?.trim()) {
    throw new Error('seedE2EUserWithDOB: email is required');
  }

  const dateOfBirth =
    input.dateOfBirth ?? dateOfBirthDaysFromToday(GOLDEN_PATH_DOB_OFFSET_DAYS);
  const name = input.name ?? 'E2E Test User';

  const prisma = getE2EPrisma();

  try {
    const byClerk = await prisma.user.findUnique({ where: { clerkId } });
    if (byClerk) {
      const user = await prisma.user.update({
        where: { id: byClerk.id },
        data: { email, name, dateOfBirth },
      });
      if (!user.dateOfBirth) {
        throw new Error('Prisma user update left dateOfBirth null');
      }
      return { id: user.id, dateOfBirth: user.dateOfBirth };
    }

    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      if (byEmail.clerkId && byEmail.clerkId !== clerkId) {
        throw new Error(
          `Email ${email} is already linked to a different Clerk account`
        );
      }
      const user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId, name, dateOfBirth },
      });
      if (!user.dateOfBirth) {
        throw new Error('Prisma user update left dateOfBirth null');
      }
      return { id: user.id, dateOfBirth: user.dateOfBirth };
    }

    const user = await prisma.user.create({
      data: { clerkId, email, name, dateOfBirth },
    });
    if (!user.dateOfBirth) {
      throw new Error('Prisma user create left dateOfBirth null');
    }
    return { id: user.id, dateOfBirth: user.dateOfBirth };
  } catch (err) {
    throw new Error(
      `Failed to seed e2e user DOB for ${email}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export { disconnectE2EPrisma };
