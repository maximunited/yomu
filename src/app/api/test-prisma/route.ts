import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(_request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const brandCount = await prisma.brand.count();

    return NextResponse.json({
      success: true,
      message: 'prismaConnectionSuccess',
      brandCount: brandCount,
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'prismaConnectionFailed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
