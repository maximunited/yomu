/* eslint-disable @typescript-eslint/no-explicit-any */
import * as prismaClient from '@/lib/prisma';
import { GET as GET_LIST, POST } from '@/app/api/admin/benefits/route';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(() =>
    Promise.resolve({ ok: true, userId: 'user_admin' })
  ),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: { benefit: { findMany: jest.fn(), create: jest.fn() } },
}));

describe('/api/admin/benefits', () => {
  const { requireAdmin } = require('@/lib/admin-auth');

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'user_admin' });
  });

  it('GET returns all benefits', async () => {
    (prismaClient.prisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 'x1' },
    ]);
    const res = await GET_LIST();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: 'x1' }]);
  });

  it('POST creates a benefit', async () => {
    (prismaClient.prisma.benefit.create as jest.Mock).mockResolvedValueOnce({
      id: 'new1',
    });
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        brandId: 'b1',
        title: 'T',
        description: 'D',
        redemptionMethod: 'M',
        validityType: 'birthday',
        isFree: true,
        isActive: true,
      }),
    } as any) as any;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json).toEqual({ id: 'new1' });
  });

  it('returns 403 when not admin', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });
    const res = await GET_LIST();
    expect(res.status).toBe(403);
  });
});
