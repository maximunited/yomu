import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: benefitId } = await params;

    const user = await getOrCreateUser(clerkUserId);

    // Delete the used benefit record
    const deletedUsedBenefit = await prisma.usedBenefit.delete({
      where: {
        userId_benefitId: {
          userId: user.id,
          benefitId: benefitId,
        },
      },
    });

    return NextResponse.json({
      message: 'benefitUnmarked',
      deletedUsedBenefit,
    });
  } catch (error) {
    console.error('Error unmarking benefit as used:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
