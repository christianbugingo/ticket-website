import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

// Initialize Prisma client
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email, password, name } = body;

    // Basic input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Enforce admin email domain
    if (!email.toLowerCase().endsWith("@itike.rw")) {
      return NextResponse.json(
        { error: "Only @itike.rw emails are allowed for admins" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN", // Explicitly set role to ADMIN
      },
    });

    // Return success response without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: "Admin created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}