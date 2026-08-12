/* eslint-disable @typescript-eslint/no-explicit-any */
import * as prismaClient from '@/lib/prisma';
import { PATCH, DELETE } from '@/app/api/admin/benefits/[id]/route';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(() =>
    Promise.resolve({ ok: true, userId: 'user_admin' })
  ),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    benefit: { update: jest.fn(), delete: jest.fn() },
    notification: { deleteMany: jest.fn() },
  },
}));

describe('/api/admin/benefits/[id]', () => {
  const { requireAdmin } = require('@/lib/admin-auth');

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'user_admin' });
  });

  it('PATCH updates isActive', async () => {
    (prismaClient.prisma.benefit.update as jest.Mock).mockResolvedValueOnce({
      id: 'b1',
      isActive: false,
    });
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    } as any) as any;
    const res = await PATCH(req, { params: Promise.resolve({ id: 'b1' }) });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toMatchObject({ id: 'b1', isActive: false });
  });

  it('DELETE removes notifications and benefit', async () => {
    (
      prismaClient.prisma.notification.deleteMany as jest.Mock
    ).mockResolvedValueOnce({});
    (prismaClient.prisma.benefit.delete as jest.Mock).mockResolvedValueOnce({
      id: 'b1',
    });
    const req = new Request('http://localhost', {
      method: 'DELETE',
    } as any) as any;
    const res = await DELETE(req, { params: Promise.resolve({ id: 'b1' }) });
    expect(res.status).toBe(200);
    expect(prismaClient.prisma.notification.deleteMany).toHaveBeenCalled();
    expect(prismaClient.prisma.benefit.delete).toHaveBeenCalled();
  });

  it('returns 403 when not admin', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    } as any) as any;
    const res = await PATCH(req, { params: Promise.resolve({ id: 'b1' }) });
    expect(res.status).toBe(403);
  });
});
