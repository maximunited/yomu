import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const newBrand = await prisma.brand.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        website: body.website,
        description: body.description,
        category: body.category,
        actionUrl: body.actionUrl,
        actionType: body.actionType,
        actionLabel: body.actionLabel,
        isActive: body.isActive ?? true
      }
    });

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 