/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET, POST } from '@/app/api/admin/url-audit/route';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(() =>
    Promise.resolve({ ok: true, userId: 'user_admin' })
  ),
}));
jest.mock('@/lib/monitoring', () => ({
  captureException: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    brand: { findMany: jest.fn() },
    benefit: { findMany: jest.fn() },
  },
}));
jest.mock('@/lib/url-audit', () => ({
  runUrlAudit: jest.fn(async () => ({
    checkedAt: '2026-08-13T00:00:00.000Z',
    results: [],
    summary: {
      total: 0,
      ok: 0,
      failures: 0,
      blocked: 0,
      stale: 0,
      unchecked: 0,
    },
  })),
}));
jest.mock('fs/promises', () => ({
  readFile: jest.fn(async () => {
    throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
  }),
  writeFile: jest.fn(async () => undefined),
  mkdir: jest.fn(async () => undefined),
}));

describe('/api/admin/url-audit', () => {
  const { requireAdmin } = require('@/lib/admin-auth');
  const prisma = require('@/lib/prisma').prisma;
  const { runUrlAudit } = require('@/lib/url-audit');

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'user_admin' });
    jest.clearAllMocks();
  });

  it('GET requires admin', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('GET returns last=null when no report', async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.last).toBeNull();
  });

  it('POST runs audit against DB urls', async () => {
    prisma.brand.findMany.mockResolvedValueOnce([
      { id: '1', name: 'Fox', website: 'https://www.fox.co.il' },
    ]);
    prisma.benefit.findMany.mockResolvedValueOnce([
      {
        id: 'b1',
        title: 'Gift',
        url: 'https://example.com/gift',
        lastChecked: null,
        brand: { name: 'Fox' },
      },
    ]);

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ limit: 10 }),
    }) as any;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(runUrlAudit).toHaveBeenCalled();
    expect(json.source).toBe('database');
    expect(json.summary.total).toBe(0);
  });

  it('POST returns 401 when unauthenticated', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const req = new Request('http://localhost', {
      method: 'POST',
      body: '{}',
    }) as any;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
