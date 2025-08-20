import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, dateOfBirth, anniversaryDate } =
      await request.json();

    // Validation
    if (!name || !email || !password || !dateOfBirth) {
      return NextResponse.json({ message: "missingFields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "passwordTooShort" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "userAlreadyExists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        anniversaryDate: anniversaryDate ? new Date(anniversaryDate) : null,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "userCreatedSuccessfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "internalServerError" },
      { status: 500 },
    );
  }
}
