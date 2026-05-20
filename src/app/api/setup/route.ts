import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// One-time setup endpoint to initialize database schema
export async function GET() {
  try {
    // Check if tables already exist by trying to count users
    const { prisma } = await import('@/lib/prisma');

    try {
      await prisma.user.count();
      return NextResponse.json({
        message: 'Database already initialized',
        status: 'success',
      });
    } catch (error) {
      // Tables don't exist, need to create them
      console.log('Database tables not found, running migration...');

      // Run Prisma db push to create tables
      const { stdout, stderr } = await execPromise('npx prisma db push --skip-generate --accept-data-loss');

      console.log('Migration stdout:', stdout);
      if (stderr) console.error('Migration stderr:', stderr);

      return NextResponse.json({
        message: 'Database initialized successfully',
        status: 'success',
        output: stdout,
      });
    }
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        message: 'Setup failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
