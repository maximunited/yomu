import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { captureException } from '@/lib/monitoring';
import {
  capUrlAuditJobs,
  runUrlAudit,
  type UrlAuditJob,
} from '@/lib/url-audit';
import type { Prisma } from '@prisma/client';

const LATEST_ID = 'latest';
const PERSISTENCE = 'database' as const;

async function readLastReport(): Promise<unknown | null> {
  const row = await prisma.urlAuditReport.findUnique({
    where: { id: LATEST_ID },
  });
  return row?.report ?? null;
}

async function writeLastReport(report: unknown, checkedAt: Date) {
  await prisma.urlAuditReport.upsert({
    where: { id: LATEST_ID },
    create: {
      id: LATEST_ID,
      report: report as Prisma.InputJsonValue,
      checkedAt,
    },
    update: {
      report: report as Prisma.InputJsonValue,
      checkedAt,
    },
  });
}

/** GET — return last persisted admin URL audit (DB-backed; Vercel-safe). */
export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const last = await readLastReport();
    return NextResponse.json({
      last,
      persistence: PERSISTENCE,
    });
  } catch (error) {
    console.error('Error reading url audit:', error);
    await captureException(error, {
      tags: { area: 'admin-url-audit', stage: 'get' },
    });
    return NextResponse.json(
      { error: 'Internal server error', persistence: PERSISTENCE },
      { status: 500 }
    );
  }
}

/**
 * POST — run URL audit against live Brand.website + Benefit.url (admin only).
 * Caps to 80 unique URLs (fair brand/benefit interleave) for serverless timeouts.
 * Persists last report in Postgres (UrlAuditReport) — not local .data/.
 */
export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    let staleDays = 60;
    let limit = 80;
    try {
      const body = await request.json();
      if (typeof body?.staleDays === 'number' && body.staleDays >= 1) {
        staleDays = body.staleDays;
      }
      if (
        typeof body?.limit === 'number' &&
        body.limit >= 1 &&
        body.limit <= 150
      ) {
        limit = body.limit;
      }
    } catch {
      // empty body is fine
    }

    const [brands, benefits] = await Promise.all([
      prisma.brand.findMany({
        select: { id: true, name: true, website: true },
        where: { isActive: true },
      }),
      prisma.benefit.findMany({
        select: {
          id: true,
          title: true,
          url: true,
          lastChecked: true,
          brand: { select: { name: true } },
        },
        where: { isActive: true, url: { not: null } },
      }),
    ]);

    const jobs: UrlAuditJob[] = [];
    for (const b of brands) {
      if (b.website) {
        jobs.push({
          kind: 'brand',
          id: b.id,
          label: b.name,
          url: b.website,
        });
      }
    }
    for (const b of benefits) {
      if (b.url) {
        jobs.push({
          kind: 'benefit',
          id: b.id,
          label: b.brand?.name ? `${b.brand.name} — ${b.title}` : b.title,
          url: b.url,
          lastChecked: b.lastChecked,
        });
      }
    }

    const capped = capUrlAuditJobs(jobs, limit);
    const report = await runUrlAudit(capped, {
      concurrency: 6,
      staleDays,
    });

    const checkedAt = new Date(report.checkedAt);
    const payload = {
      source: 'database',
      persistence: PERSISTENCE,
      staleDays,
      limit,
      requested: jobs.length,
      ...report,
    };

    try {
      await writeLastReport(payload, checkedAt);
    } catch (persistError) {
      console.error('Could not persist url-audit report:', persistError);
      await captureException(persistError, {
        tags: { area: 'admin-url-audit', stage: 'persist' },
      });
      return NextResponse.json(
        {
          ...payload,
          persisted: false,
          persistError: 'Failed to save report to database',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ ...payload, persisted: true });
  } catch (error) {
    console.error('Error running url audit:', error);
    await captureException(error, {
      tags: { area: 'admin-url-audit', stage: 'post' },
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
