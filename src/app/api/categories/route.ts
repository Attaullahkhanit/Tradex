import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.category.count(),
    ]);

    const last_page = Math.ceil(total / limit);
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const path = `${protocol}://${host}/api/categories`;

    return NextResponse.json({
      status: true,
      message: "Data fetched successfully",
      data: {
        current_page: page,
        data: categories,
        first_page_url: `${path}?page=1`,
        from: skip + 1,
        last_page: last_page,
        last_page_url: `${path}?page=${last_page}`,
        next_page_url: page < last_page ? `${path}?page=${page + 1}` : null,
        path: path,
        per_page: limit,
        prev_page_url: page > 1 ? `${path}?page=${page - 1}` : null,
        to: skip + categories.length,
        total: total,
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
