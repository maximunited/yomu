import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Testing users in database ===");
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${users.length} users:`, users);
    
    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users
    });
  } catch (error) {
    console.error("Error testing users:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 