import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { captureException } from '@/lib/monitoring';
import { seed } from '@/lib/catalog-seed';

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  if (process.env.ALLOW_API_SEED !== '1') {
    return NextResponse.json(
      {
        error:
          'API seed is disabled. Use `node scripts/seed.js --mode=upsert` (set ALLOW_API_SEED=1 to override).',
      },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'upsert';
    const brands = searchParams.get('brands') ?? undefined;

    const result = await seed({ mode, brands });

    return NextResponse.json({
      message: 'databaseSeedSuccess',
      mode: result.mode,
      brandsCreated: result.brandsCreated,
      benefitsCreated: result.benefitsProcessed,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    await captureException(error, {
      tags: { area: 'api-seed', stage: 'post' },
    });
    return NextResponse.json({ message: 'databaseSeedError' }, { status: 500 });
  }
}
