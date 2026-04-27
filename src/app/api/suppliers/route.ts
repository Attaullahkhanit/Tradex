import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "name-asc";

    let whereClause: Prisma.SupplierWhereInput = {};

    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

    let orderBy: Prisma.SupplierOrderByWithRelationInput = {};
    if (sortBy === "name-asc") orderBy = { name: "asc" };
    else if (sortBy === "name-desc") orderBy = { name: "desc" };
    else if (sortBy === "newest") orderBy = { createdAt: "desc" };
    else orderBy = { name: "asc" }; // default

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          products: {
            select: {
              productId: true,
            },
          },
        },
        orderBy,
      }),
      prisma.supplier.count({ where: whereClause }),
    ]);

    const formattedSuppliers = suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      isActive: supplier.isActive,
      skuCount: supplier.products.length,
      leadDays: Math.floor(Math.random() * 5) + 2, // Dummy for UI
      minOrderQty: Math.floor(Math.random() * 50) + 20, // Dummy for UI
      lastOrderDaysAgo: Math.floor(Math.random() * 10) + 1, // Dummy for UI
    }));

    return NextResponse.json({
      data: formattedSuppliers,
      total,
      current_page: page,
      last_page: Math.ceil(total / limit),
      per_page: limit,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

