import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          orders: {
            select: {
              total: true,
            },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    const customers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      orderCount: user._count.orders,
      totalSpend: user.orders.reduce((sum, order) => sum + order.total, 0),
    }));

    const last_page = Math.ceil(total / limit);
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const path = `${protocol}://${host}/api/customers`;

    return NextResponse.json({
      status: true,
      message: "Data fetched successfully",
      data: {
        current_page: page,
        data: customers,
        first_page_url: `${path}?page=1`,
        from: skip + 1,
        last_page: last_page,
        last_page_url: `${path}?page=${last_page}`,
        next_page_url: page < last_page ? `${path}?page=${page + 1}` : null,
        path: path,
        per_page: limit,
        prev_page_url: page > 1 ? `${path}?page=${page - 1}` : null,
        to: skip + customers.length,
        total: total,
      }
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
