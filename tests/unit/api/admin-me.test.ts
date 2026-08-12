/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from '@/app/api/admin/me/route';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(() =>
    Promise.resolve({ ok: true, userId: 'user_admin' })
  ),
}));

describe('/api/admin/me', () => {
  const { requireAdmin } = require('@/lib/admin-auth');

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'user_admin' });
    jest.clearAllMocks();
  });

  it('returns ok:true for admin', async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
  });

  it('returns 403 for non-admin', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
