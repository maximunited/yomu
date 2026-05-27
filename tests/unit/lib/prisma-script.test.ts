/**
 * Unit tests for Prisma Client factory for scripts
 */

// Mock Prisma Client and dependencies before importing
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(),
}));

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    end: jest.fn(),
  })),
}));

describe('prisma-script', () => {
  const originalEnv = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalEnv;
    // Reset module registry to clear cached instances
    jest.resetModules();
  });

  describe('createPrismaClient', () => {
    it('should throw error when DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;

      // Import after clearing env var
      const { createPrismaClient } = require('@/lib/prisma-script');

      expect(() => createPrismaClient()).toThrow(
        'DATABASE_URL environment variable is required'
      );
    });

    it('should create PrismaClient when DATABASE_URL is set', () => {
      process.env.DATABASE_URL =
        'postgresql://user:password@localhost:5432/testdb';

      const { createPrismaClient } = require('@/lib/prisma-script');
      const client = createPrismaClient();

      expect(client).toBeDefined();
      expect(client.$connect).toBeDefined();
      expect(client.$disconnect).toBeDefined();
    });
  });

  describe('disconnectPrisma', () => {
    it('should handle disconnect when no client exists', async () => {
      const { disconnectPrisma } = require('@/lib/prisma-script');
      await expect(disconnectPrisma()).resolves.not.toThrow();
    });
  });
});
