/**
 * Prisma client module tests
 * Note: The actual Prisma client setup (src/lib/prisma.ts) is excluded from
 * coverage as it's infrastructure code that's globally mocked in tests.
 * The Prisma 7 adapter pattern with Pool/adapter caching is verified through
 * integration tests.
 */

describe('prisma singleton module', () => {
  it('exports prisma instance', () => {
    const { prisma } = require('@/lib/prisma');
    expect(prisma).toBeDefined();
  });

  it('has user model methods', () => {
    const { prisma } = require('@/lib/prisma');
    expect(prisma.user).toBeDefined();
    expect(typeof prisma.user.findUnique).toBe('function');
    expect(typeof prisma.user.findFirst).toBe('function');
    expect(typeof prisma.user.create).toBe('function');
    expect(typeof prisma.user.update).toBe('function');
  });

  it('has brand model methods', () => {
    const { prisma } = require('@/lib/prisma');
    expect(prisma.brand).toBeDefined();
    expect(typeof prisma.brand.findMany).toBe('function');
    expect(typeof prisma.brand.findUnique).toBe('function');
  });

  it('has benefit model methods', () => {
    const { prisma } = require('@/lib/prisma');
    expect(prisma.benefit).toBeDefined();
    expect(typeof prisma.benefit.findMany).toBe('function');
    expect(typeof prisma.benefit.findUnique).toBe('function');
  });

  it('has userMembership model methods', () => {
    const { prisma } = require('@/lib/prisma');
    expect(prisma.userMembership).toBeDefined();
    expect(typeof prisma.userMembership.findMany).toBe('function');
  });
});
