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
    urlAuditReport: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));
jest.mock('@/lib/url-audit', () => ({
  capUrlAuditJobs: jest.fn((jobs: unknown[], limit: number) =>
    (jobs as unknown[]).slice(0, limit)
  ),
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

describe('/api/admin/url-audit', () => {
  const { requireAdmin } = require('@/lib/admin-auth');
  const prisma = require('@/lib/prisma').prisma;
  const { runUrlAudit, capUrlAuditJobs } = require('@/lib/url-audit');

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'user_admin' });
    prisma.urlAuditReport.findUnique.mockResolvedValue(null);
    prisma.urlAuditReport.upsert.mockResolvedValue({});
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

  it('GET returns last=null with persistence=database when no report', async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.last).toBeNull();
    expect(json.persistence).toBe('database');
  });

  it('POST runs audit against DB urls and persists', async () => {
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
    expect(capUrlAuditJobs).toHaveBeenCalled();
    expect(runUrlAudit).toHaveBeenCalled();
    expect(prisma.urlAuditReport.upsert).toHaveBeenCalled();
    expect(json.source).toBe('database');
    expect(json.persistence).toBe('database');
    expect(json.persisted).toBe(true);
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
