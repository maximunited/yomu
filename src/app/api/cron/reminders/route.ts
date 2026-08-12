import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import {
  isValidCronSecret,
  runReminderPipeline,
  type ReminderPrisma,
} from '@/lib/reminders';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Note: each future `/api/cron/*` route needs its own auth gate — Clerk marks
 * `/api/cron(.*)` public, so cookie sessions must not be enough for GET.
 */

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function secretNotConfigured(): NextResponse {
  return NextResponse.json(
    { error: 'CRON_SECRET is not configured' },
    { status: 503 }
  );
}

/** GET: CRON_SECRET Bearer only (no admin cookie — CSRF). Fail closed. */
function authorizeGet(
  request: NextRequest
): { ok: true } | { ok: false; response: NextResponse } {
  if (!process.env.CRON_SECRET) {
    return { ok: false, response: secretNotConfigured() };
  }
  if (!isValidCronSecret(request.headers.get('authorization'))) {
    return { ok: false, response: unauthorized() };
  }
  return { ok: true };
}

/** POST: CRON_SECRET Bearer or requireAdmin() for manual runs. */
async function authorizePost(
  request: NextRequest
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  if (isValidCronSecret(request.headers.get('authorization'))) {
    return { ok: true };
  }

  if (!process.env.CRON_SECRET) {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return { ok: false, response: secretNotConfigured() };
    }
    return { ok: true };
  }

  const admin = await requireAdmin();
  if (admin.ok) return { ok: true };
  return { ok: false, response: admin.response };
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const result = await runReminderPipeline(prisma as unknown as ReminderPrisma);

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  });
}

export async function GET(request: NextRequest) {
  const gate = authorizeGet(request);
  if (!gate.ok) return gate.response;
  return handle(request);
}

export async function POST(request: NextRequest) {
  const gate = await authorizePost(request);
  if (!gate.ok) return gate.response;
  return handle(request);
}
