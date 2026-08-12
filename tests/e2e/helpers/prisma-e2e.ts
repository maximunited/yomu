import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { assertE2EDbWriteAllowed } from './e2e-db-guard';

let pool: Pool | undefined;
let prisma: PrismaClient | undefined;

/**
 * Shared Prisma client for Playwright setup / fixtures (not the Next.js singleton).
 * Fail-closed: requires E2E_ALLOW_DB_SEED=1 and a local (or explicitly allowed remote) DATABASE_URL.
 */
export function getE2EPrisma(): PrismaClient {
  assertE2EDbWriteAllowed();

  const connectionString = process.env.DATABASE_URL!;

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
