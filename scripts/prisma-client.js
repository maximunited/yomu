/**
 * Prisma Client factory for Node.js scripts
 * Creates PrismaClient with PostgreSQL driver adapter
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

let cachedPool;
let cachedPrisma;

function createPrismaClient() {
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

async function disconnectPrisma() {
  if (cachedPrisma) {
    await cachedPrisma.$disconnect();
  }
  if (cachedPool) {
    await cachedPool.end();
  }
  cachedPrisma = undefined;
  cachedPool = undefined;
}

module.exports = {
  createPrismaClient,
  disconnectPrisma,
};
