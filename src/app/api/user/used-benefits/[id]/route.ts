import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: benefitId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the used benefit record
    const deletedUsedBenefit = await prisma.usedBenefit.delete({
      where: {
        userId_benefitId: {
          userId: user.id,
          benefitId: benefitId
        }
      }
    });

    return NextResponse.json({ message: "Benefit unmarked as used", deletedUsedBenefit });
  } catch (error) {
    console.error("Error unmarking benefit as used:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 