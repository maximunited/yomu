/**
 * Dangerous /api/seed contracts: requireAdmin + ALLOW_API_SEED=1.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/seed/route';

jest.mock('@/lib/catalog-seed', () => ({
  seed: jest.fn(),
}));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(),
}));

describe('/api/seed security', () => {
  const { seed } = require('@/lib/catalog-seed');
  const { requireAdmin } = require('@/lib/admin-auth');
  const originalAllow = process.env.ALLOW_API_SEED;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ALLOW_API_SEED;
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
    seed.mockResolvedValue({
      mode: 'upsert',
      brandsCreated: 57,
      benefitsProcessed: 57,
    });
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
    expect(requireAdmin).toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(seed).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated non-admin', async () => {
    process.env.ALLOW_API_SEED = '1';
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const res = await post();
    const body = await res.json();

    expect(requireAdmin).toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
    expect(body.error).not.toMatch(/ALLOW_API_SEED/);
    expect(seed).not.toHaveBeenCalled();
  });

  it('returns 403 when admin but ALLOW_API_SEED is not set', async () => {
    const res = await post();
    const body = await res.json();

    expect(requireAdmin).toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(body.error).toMatch(/ALLOW_API_SEED/);
    expect(seed).not.toHaveBeenCalled();
  });

  it('returns 403 when ALLOW_API_SEED is not exactly 1', async () => {
    process.env.ALLOW_API_SEED = 'true';
    const res = await post();
    expect(requireAdmin).toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(seed).not.toHaveBeenCalled();
  });

  it('delegates to scripts/seed.js upsert when admin and ALLOW_API_SEED=1', async () => {
    process.env.ALLOW_API_SEED = '1';

    const res = await post();
    const body = await res.json();

    expect(requireAdmin).toHaveBeenCalled();
    expect(seed).toHaveBeenCalledWith({ mode: 'upsert', brands: undefined });
    expect(res.status).toBe(200);
    expect(body.message).toBe('databaseSeedSuccess');
    expect(body.mode).toBe('upsert');
    expect(body.brandsCreated).toBe(57);
    expect(body.benefitsCreated).toBe(57);
  });
});
