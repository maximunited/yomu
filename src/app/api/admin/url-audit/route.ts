import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { captureException } from '@/lib/monitoring';
import { runUrlAudit, type UrlAuditJob } from '@/lib/url-audit';
import fs from 'fs/promises';
import path from 'path';

const REPORT_PATH = path.join(process.cwd(), '.data', 'url-audit-last.json');

async function readLastReport() {
  try {
    const raw = await fs.readFile(REPORT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeLastReport(report: unknown) {
  try {
    await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  } catch (error) {
    console.warn('Could not persist url-audit report:', error);
  }
}

/** GET — return last persisted admin URL audit (if any). */
export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const last = await readLastReport();
    return NextResponse.json({ last });
  } catch (error) {
    console.error('Error reading url audit:', error);
    await captureException(error, { tags: { area: 'admin-url-audit', stage: 'get' } });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST — run URL audit against live Brand.website + Benefit.url (admin only).
 * Caps to 80 unique URLs to keep serverless timeouts honest.
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
      if (typeof body?.limit === 'number' && body.limit >= 1 && body.limit <= 150) {
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

    const capped = jobs.slice(0, limit);
    const report = await runUrlAudit(capped, {
      concurrency: 6,
      staleDays,
    });

    const payload = {
      source: 'database',
      staleDays,
      limit,
      requested: jobs.length,
      ...report,
    };

    await writeLastReport(payload);
    return NextResponse.json(payload);
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
