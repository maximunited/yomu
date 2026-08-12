/**
 * Dangerous /api/setup contracts: requireAdmin gate (401/403).
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { GET } from '@/app/api/setup/route';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { count: jest.fn() },
  },
}));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(),
}));

describe('/api/setup security', () => {
  const mockPrisma = require('@/lib/prisma').prisma;
  const { requireAdmin } = require('@/lib/admin-auth');

  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
  });

  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockPrisma.user.count).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated non-admin', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const res = await GET();
    expect(res.status).toBe(403);
    expect(mockPrisma.user.count).not.toHaveBeenCalled();
  });

  it('reaches DB check only when admin', async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockPrisma.user.count).toHaveBeenCalledTimes(1);
  });
});
