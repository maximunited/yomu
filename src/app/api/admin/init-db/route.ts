import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Database initialization endpoint - runs Prisma migrations
// IMPORTANT: This should be protected or removed after initial setup
export async function POST() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          message: 'DATABASE_URL environment variable not found',
          status: 'error',
        },
        { status: 500 }
      );
    }

    // Run prisma db push to create tables
    const { stdout, stderr } = await execAsync(
      'npx prisma db push --skip-generate --accept-data-loss',
      {
        env: process.env,
      }
    );

    return NextResponse.json({
      message: 'Database initialized successfully',
      status: 'success',
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error) {
    console.error('Database initialization error:', error);

    return NextResponse.json(
      {
        message: 'Failed to initialize database',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if this API is available
export async function GET() {
  return NextResponse.json({
    message:
      'Database initialization endpoint. Send POST request to initialize database.',
    status: 'ready',
    hasDatabase: !!process.env.DATABASE_URL,
  });
}
