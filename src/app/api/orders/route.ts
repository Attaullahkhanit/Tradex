import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const where: any = {};
    if (status !== "all") {
      where.status = status;
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: { orderItems: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const last_page = Math.ceil(total / limit);
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const path = `${protocol}://${host}/api/orders`;

    return NextResponse.json({
      status: true,
      message: "Data fetched successfully",
      data: {
        current_page: page,
        data: orders,
        first_page_url: `${path}?page=1`,
        from: skip + 1,
        last_page: last_page,
        last_page_url: `${path}?page=${last_page}`,
        next_page_url: page < last_page ? `${path}?page=${page + 1}` : null,
        path: path,
        per_page: limit,
        prev_page_url: page > 1 ? `${path}?page=${page - 1}` : null,
        to: skip + orders.length,
        total: total,
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
