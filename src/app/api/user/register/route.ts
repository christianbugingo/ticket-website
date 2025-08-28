// app/api/user/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the user schema for validation
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "BUS_OPERATOR", "USER"]).optional(),
  location: z.string().optional(),
});

// Handle POST request to create a new user
export async function POST(req: Request) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = userSchema.parse(body);

    const { email, password, name, phone, role, location } = validatedData;

    // Check for existing user with the same email
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

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || "USER", // Default to USER if not specified
        
      },
    });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle validation errors from zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    // Handle Prisma-specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("Prisma Error Code:", error.code); // Debug log
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Fallback for unique constraint errors if code isn't available
    if (error instanceof Prisma.PrismaClientKnownRequestError) {  
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client to free resources
    await prisma.$disconnect();
  }
}