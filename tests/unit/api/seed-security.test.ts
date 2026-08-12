/**
 * Dangerous /api/seed contracts: requireAdmin + ALLOW_API_SEED=1.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/seed/route';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    benefit: { deleteMany: jest.fn(), create: jest.fn() },
    userMembership: { deleteMany: jest.fn() },
    brand: { deleteMany: jest.fn(), create: jest.fn() },
    brandPartnership: { create: jest.fn() },
  },
}));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(),
}));

describe('/api/seed security', () => {
  const mockPrisma = require('@/lib/prisma').prisma;
  const { requireAdmin } = require('@/lib/admin-auth');
  const originalAllow = process.env.ALLOW_API_SEED;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ALLOW_API_SEED;
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
  });

  afterAll(() => {
    if (originalAllow === undefined) {
      delete process.env.ALLOW_API_SEED;
    } else {
      process.env.ALLOW_API_SEED = originalAllow;
    }
  });

  const post = () =>
    POST(new NextRequest('http://localhost:3000/api/seed', { method: 'POST' }));

  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const res = await post();
    expect(res.status).toBe(401);
    expect(mockPrisma.brand.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated non-admin', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const res = await post();
    expect(res.status).toBe(403);
    expect(mockPrisma.brand.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 403 when admin but ALLOW_API_SEED is not set', async () => {
    const res = await post();
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/ALLOW_API_SEED/);
    expect(mockPrisma.brand.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.benefit.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 403 when ALLOW_API_SEED is not exactly 1', async () => {
    process.env.ALLOW_API_SEED = 'true';
    const res = await post();
    expect(res.status).toBe(403);
    expect(mockPrisma.brand.deleteMany).not.toHaveBeenCalled();
  });
});
