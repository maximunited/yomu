import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: PrismaPg | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Reuse cached pool and adapter to prevent connection leaks on hot-reload
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ connectionString });
  }

  if (!globalForPrisma.adapter) {
    globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
  }

  return new PrismaClient({ adapter: globalForPrisma.adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
