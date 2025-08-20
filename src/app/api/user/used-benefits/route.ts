import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        usedBenefits: {
          include: {
            benefit: {
              include: {
                brand: true,
              },
            },
          },
          orderBy: {
            usedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ usedBenefits: user.usedBenefits });
  } catch (error) {
    console.error("Error fetching used benefits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { benefitId, notes } = await request.json();

    if (!benefitId) {
      return NextResponse.json(
        { error: "Benefit ID is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if benefit exists
    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId },
    });

    if (!benefit) {
      return NextResponse.json({ error: "Benefit not found" }, { status: 404 });
    }

    // Create or update used benefit
    const usedBenefit = await prisma.usedBenefit.upsert({
      where: {
        userId_benefitId: {
          userId: user.id,
          benefitId: benefitId,
        },
      },
      update: {
        usedAt: new Date(),
        notes: notes || null,
      },
      create: {
        userId: user.id,
        benefitId: benefitId,
        notes: notes || null,
      },
      include: {
        benefit: {
          include: {
            brand: true,
          },
        },
      },
    });

    return NextResponse.json({ usedBenefit });
  } catch (error) {
    console.error("Error marking benefit as used:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
