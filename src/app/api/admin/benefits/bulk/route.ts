import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { captureException } from '@/lib/monitoring';

/**
 * Bulk update benefit verification flags.
 * Body: { ids: string[], verified: boolean }
 * Sets lastChecked to now when verified=true; clears when verified=false.
 */
export async function PATCH(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const body = await request.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === 'string')
      : [];
    const verified = body?.verified;

    if (!ids.length) {
      return NextResponse.json(
        { error: 'ids array required' },
        { status: 400 }
      );
    }
    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'verified boolean required' },
        { status: 400 }
      );
    }
    if (ids.length > 200) {
      return NextResponse.json(
        { error: 'max 200 ids per request' },
        { status: 400 }
      );
    }

    const now = new Date();
    const result = await prisma.benefit.updateMany({
      where: { id: { in: ids } },
      data: {
        verified,
        lastChecked: verified ? now : null,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      updated: result.count,
      verified,
      lastChecked: verified ? now.toISOString() : null,
    });
  } catch (error) {
    console.error('Error bulk-updating benefits:', error);
    await captureException(error, {
      tags: { area: 'admin-benefits-bulk' },
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
