import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let pool: Pool | undefined;
let prisma: PrismaClient | undefined;

/** Shared Prisma client for Playwright setup / fixtures (not the Next.js singleton). */
export function getE2EPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required for authenticated e2e Prisma seeding'
    );
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }
  if (!prisma) {
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return prisma;
}

export async function disconnectE2EPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
