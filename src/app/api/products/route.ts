import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: { OR: Array<{ name: { contains: string } } | { description: { contains: string } }>; categoryId?: string } = {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    };

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    if (sortBy === "price-asc") orderBy = { price: "asc" };
    if (sortBy === "price-desc") orderBy = { price: "desc" };
    if (sortBy === "name-asc") orderBy = { name: "asc" };
    if (sortBy === "name-desc") orderBy = { name: "desc" };
    if (sortBy === "stock-low") orderBy = { stock: "asc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const last_page = Math.ceil(total / limit);
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const path = `${protocol}://${host}/api/products`;

    return NextResponse.json({
      status: true,
      message: "Data fetched successfully",
      data: {
        current_page: page,
        data: products,
        first_page_url: `${path}?page=1`,
        from: skip + 1,
        last_page: last_page,
        last_page_url: `${path}?page=${last_page}`,
        next_page_url: page < last_page ? `${path}?page=${page + 1}` : null,
        path: path,
        per_page: limit,
        prev_page_url: page > 1 ? `${path}?page=${page - 1}` : null,
        to: skip + products.length,
        total: total,
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, stock, categoryId, image } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        image,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
