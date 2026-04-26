import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    console.log("Attempting direct password reset for:", email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found for direct reset:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: { set: null },
        resetTokenExpiry: { set: null },
      },
    });

    console.log("Password successfully updated for user:", updatedUser.email);
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: unknown) {
    console.error("Direct reset error details:", error);
    return NextResponse.json({ 
      message: "An internal server error occurred",
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
