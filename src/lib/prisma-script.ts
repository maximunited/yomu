/**
 * Prisma Client factory for Node.js scripts
 * Creates PrismaClient with PostgreSQL driver adapter
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let cachedPool: Pool | undefined;
let cachedPrisma: PrismaClient | undefined;

export function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required. Please set it before running this script.'
    );
  }

  if (!cachedPool) {
    cachedPool = new Pool({ connectionString });
  }

  if (!cachedPrisma) {
    const adapter = new PrismaPg(cachedPool);
    cachedPrisma = new PrismaClient({ adapter });
  }

  return cachedPrisma;
}

export async function disconnectPrisma() {
  if (cachedPrisma) {
    await cachedPrisma.$disconnect();
  }
  if (cachedPool) {
    await cachedPool.end();
  }
  cachedPrisma = undefined;
  cachedPool = undefined;
}
