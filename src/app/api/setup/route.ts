import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Database setup endpoint - checks if schema exists
export async function GET() {
  try {
    // Try to query the database to check if tables exist
    await prisma.user.count();

    return NextResponse.json({
      message: 'Database is initialized and working',
      status: 'success',
      tablesExist: true,
    });
  } catch (error) {
    console.error('Database check error:', error);

    return NextResponse.json(
      {
        message:
          'Database tables do not exist. Run: npx prisma db push (locally with Vercel env)',
        status: 'error',
        tablesExist: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        instructions: [
          '1. Install Vercel CLI: npm i -g vercel',
          '2. Login: vercel login',
          '3. Link project: vercel link',
          '4. Pull env: vercel env pull .env.local',
          '5. Run migration: npx prisma db push',
        ],
      },
      { status: 500 }
    );
  }
}

