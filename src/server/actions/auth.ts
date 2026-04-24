"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function signUpUser(formData: z.infer<typeof signupSchema>) {
  console.log("SIGNUP: Started direct database insert process...");
  try {
    const validatedFields = signupSchema.safeParse(formData);

    if (!validatedFields.success) {
      console.error("SIGNUP: Validation failed", validatedFields.error.flatten());
      throw new Error("Invalid fields");
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    console.log("SIGNUP: Checking email:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("SIGNUP: User already exists");
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in SQLite
    console.log("SIGNUP: Executing prisma.user.create...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    console.log("SIGNUP: Successfully saved to SQLite ID:", user.id);

    // Generate JWT token for session
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // We don't return anything here because redirect() throws an error
    // that Next.js catches to handle the navigation server-side.
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("SIGNUP_ERROR:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save user to database");
  }
  
  redirect("/dashboard/products");
}

export async function signInUser(formData: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(formData);

    if (!validatedFields.success) {
      throw new Error("Invalid fields");
    }

    const { email, password } = validatedFields.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // No return needed as redirect handles the flow
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("LOGIN_ERROR:", error);
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred during login");
  }

  redirect("/dashboard/products");
}

export async function signOutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}
