import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Database initialization endpoint - creates all tables
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

    // Execute raw SQL to create all tables based on Prisma schema
    // This is a workaround since we can't run `prisma db push` in serverless
    await prisma.$executeRawUnsafe(`
      -- Create User table
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "password" TEXT,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "dateOfBirth" TIMESTAMP(3),
        "anniversaryDate" TIMESTAMP(3),
        "profilePicture" TEXT,
        "apiKey" TEXT NOT NULL DEFAULT 'key123',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Account table
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
      );

      -- Create Session table
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- Create VerificationToken table
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
      );

      -- Create brands table
      CREATE TABLE IF NOT EXISTS "brands" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logoUrl" TEXT NOT NULL,
        "website" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "actionUrl" TEXT,
        "actionType" TEXT,
        "actionLabel" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create brand_partnerships table
      CREATE TABLE IF NOT EXISTS "brand_partnerships" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "brandAId" TEXT NOT NULL,
        "brandBId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "brand_partnerships_brandAId_fkey" FOREIGN KEY ("brandAId") REFERENCES "brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "brand_partnerships_brandBId_fkey" FOREIGN KEY ("brandBId") REFERENCES "brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "brand_partnerships_brandAId_brandBId_key" UNIQUE ("brandAId", "brandBId")
      );

      -- Create benefits table
      CREATE TABLE IF NOT EXISTS "benefits" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "brandId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "termsAndConditions" TEXT,
        "redemptionMethod" TEXT NOT NULL,
        "promoCode" TEXT,
        "url" TEXT,
        "validityType" TEXT NOT NULL,
        "validityDuration" INTEGER,
        "isFree" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "benefits_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- Create custom_memberships table
      CREATE TABLE IF NOT EXISTS "custom_memberships" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "icon" TEXT NOT NULL DEFAULT '/images/brands/restaurant.svg',
        "type" TEXT NOT NULL DEFAULT 'free',
        "cost" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "custom_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- Create custom_benefits table
      CREATE TABLE IF NOT EXISTS "custom_benefits" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "customMembershipId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "termsAndConditions" TEXT,
        "redemptionMethod" TEXT NOT NULL,
        "promoCode" TEXT,
        "url" TEXT,
        "validityType" TEXT NOT NULL,
        "validityDuration" INTEGER,
        "isFree" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "custom_benefits_customMembershipId_fkey" FOREIGN KEY ("customMembershipId") REFERENCES "custom_memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- Create user_memberships table
      CREATE TABLE IF NOT EXISTS "user_memberships" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "brandId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "customMembershipId" TEXT,
        CONSTRAINT "user_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_memberships_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_memberships_customMembershipId_fkey" FOREIGN KEY ("customMembershipId") REFERENCES "custom_memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_memberships_userId_brandId_key" UNIQUE ("userId", "brandId"),
        CONSTRAINT "user_memberships_userId_customMembershipId_key" UNIQUE ("userId", "customMembershipId")
      );

      -- Create notifications table
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "benefitId" TEXT,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "scheduledFor" TIMESTAMP(3),
        "sentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "notifications_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "benefits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- Create used_benefits table
      CREATE TABLE IF NOT EXISTS "used_benefits" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "benefitId" TEXT NOT NULL,
        "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "used_benefits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "used_benefits_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "benefits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "used_benefits_userId_benefitId_key" UNIQUE ("userId", "benefitId")
      );
    `);

    return NextResponse.json({
      message: 'Database initialized successfully',
      status: 'success',
      tables: [
        'User',
        'Account',
        'Session',
        'VerificationToken',
        'brands',
        'brand_partnerships',
        'benefits',
        'custom_memberships',
        'custom_benefits',
        'user_memberships',
        'notifications',
        'used_benefits',
      ],
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
