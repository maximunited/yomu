/**
 * Cron reminders route: GET = CRON_SECRET only; POST = Bearer or requireAdmin.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/cron/reminders/route';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userMembership: { findMany: jest.fn() },
    notification: { findFirst: jest.fn(), create: jest.fn() },
  },
}));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(),
}));

jest.mock('@/lib/reminders', () => {
  const actual = jest.requireActual('@/lib/reminders');
  return {
    ...actual,
    runReminderPipeline: jest.fn(),
  };
});

describe('/api/cron/reminders', () => {
  const { requireAdmin } = require('@/lib/admin-auth');
  const { runReminderPipeline } = require('@/lib/reminders');
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
    runReminderPipeline.mockResolvedValue({
      scannedMemberships: 0,
      candidates: 0,
      created: 0,
      skippedDuplicate: 0,
      emailsAttempted: 0,
      emailsSent: 0,
      pushAttempted: 0,
      pushSent: 0,
      smsAttempted: 0,
      smsSent: 0,
      errors: [],
    });
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  const call = (method: 'GET' | 'POST', auth?: string) => {
    const headers: HeadersInit = {};
    if (auth) headers.authorization = auth;
    const req = new NextRequest('http://localhost:3000/api/cron/reminders', {
      method,
      headers,
    });
    return method === 'GET' ? GET(req) : POST(req);
  };

  it('allows Bearer CRON_SECRET without admin (POST)', async () => {
    const res = await call('POST', 'Bearer test-cron-secret');
    expect(res.status).toBe(200);
    expect(requireAdmin).not.toHaveBeenCalled();
    expect(runReminderPipeline).toHaveBeenCalled();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('allows GET with valid secret (Vercel Cron)', async () => {
    const res = await call('GET', 'Bearer test-cron-secret');
    expect(res.status).toBe(200);
    expect(requireAdmin).not.toHaveBeenCalled();
    expect(runReminderPipeline).toHaveBeenCalled();
  });

  it('rejects GET with admin session but no Bearer (CSRF)', async () => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
    const res = await call('GET');
    expect(res.status).toBe(401);
    expect(requireAdmin).not.toHaveBeenCalled();
    expect(runReminderPipeline).not.toHaveBeenCalled();
  });

  it('rejects GET with wrong Bearer even if admin', async () => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
    const res = await call('GET', 'Bearer wrong');
    expect(res.status).toBe(401);
    expect(requireAdmin).not.toHaveBeenCalled();
    expect(runReminderPipeline).not.toHaveBeenCalled();
  });

  it('returns 503 on GET when CRON_SECRET unset', async () => {
    delete process.env.CRON_SECRET;
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
    const res = await call('GET');
    expect(res.status).toBe(503);
    expect(requireAdmin).not.toHaveBeenCalled();
    expect(runReminderPipeline).not.toHaveBeenCalled();
  });

  it('allows POST admin when secret missing from request', async () => {
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
    const res = await call('POST');
    expect(requireAdmin).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('returns 401 when POST secret wrong and unauthenticated', async () => {
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await call('POST', 'Bearer wrong');
    expect(res.status).toBe(401);
    expect(runReminderPipeline).not.toHaveBeenCalled();
  });

  it('returns 503 when CRON_SECRET unset and POST not admin', async () => {
    delete process.env.CRON_SECRET;
    const { NextResponse } = require('next/server');
    requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await call('POST');
    expect(res.status).toBe(503);
    expect(runReminderPipeline).not.toHaveBeenCalled();
  });

  it('allows POST admin when CRON_SECRET unset', async () => {
    delete process.env.CRON_SECRET;
    requireAdmin.mockResolvedValue({ ok: true, userId: 'admin_1' });
    const res = await call('POST');
    expect(requireAdmin).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(runReminderPipeline).toHaveBeenCalled();
  });
});
