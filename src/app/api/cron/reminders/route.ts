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

async function authorize(
  request: NextRequest
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  if (isValidCronSecret(request.headers.get('authorization'))) {
    return { ok: true };
  }

  const admin = await requireAdmin();
  if (admin.ok) return { ok: true };
  return { ok: false, response: admin.response };
}

async function handle(request: NextRequest): Promise<NextResponse> {
  if (!process.env.CRON_SECRET) {
    // Fail closed when secret unset — admin may still run manually.
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured' },
        { status: 503 }
      );
    }
  } else {
    const gate = await authorize(request);
    if (!gate.ok) return gate.response;
  }

  const result = await runReminderPipeline(prisma as unknown as ReminderPrisma);

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
