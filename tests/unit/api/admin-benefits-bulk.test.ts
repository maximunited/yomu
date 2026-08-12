/* eslint-disable @typescript-eslint/no-explicit-any */
import * as prismaClient from '@/lib/prisma';
import { PATCH } from '@/app/api/admin/benefits/bulk/route';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(() =>
    Promise.resolve({ ok: true, userId: 'user_admin' })
  ),
}));
jest.mock('@/lib/monitoring', () => ({
  captureException: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: { benefit: { updateMany: jest.fn() } },
}));

describe('/api/admin/benefits/bulk', () => {
  const { requireAdmin } = require('@/lib/admin-auth');

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'user_admin' });
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ['a'], verified: true }),
    }) as any;
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('rejects missing ids', async () => {
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ verified: true }),
    }) as any;
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('bulk verifies and sets lastChecked', async () => {
    (prismaClient.prisma.benefit.updateMany as jest.Mock).mockResolvedValueOnce(
      { count: 2 }
    );
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ['b1', 'b2'], verified: true }),
    }) as any;
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.updated).toBe(2);
    expect(json.verified).toBe(true);
    expect(json.lastChecked).toBeTruthy();
    expect(prismaClient.prisma.benefit.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['b1', 'b2'] } },
        data: expect.objectContaining({ verified: true }),
      })
    );
  });

  it('bulk unverifies and clears lastChecked', async () => {
    (prismaClient.prisma.benefit.updateMany as jest.Mock).mockResolvedValueOnce(
      { count: 1 }
    );
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ['b1'], verified: false }),
    }) as any;
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.verified).toBe(false);
    expect(json.lastChecked).toBeNull();
  });
});
