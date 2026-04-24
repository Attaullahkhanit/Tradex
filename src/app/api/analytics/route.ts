import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // 1. KPI Cards
    const [totalRevenueResult, ordersToday, newCustomers, lowStockItems] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: subDays(now, 30),
          },
        },
      }),
      prisma.product.count({
        where: {
          stock: {
            lt: 5,
          },
        },
      }),
    ]);

    // 2. Revenue Chart Data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const start = startOfDay(date);
      const end = endOfDay(date);

      const dayRevenue = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _sum: { total: true },
      });

      chartData.push({
        name: format(date, "MMM dd"),
        revenue: dayRevenue._sum.total || 0,
      });
    }

    // 3. Top Selling Products (By revenue from OrderItems)
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const enrichedTopProducts = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: { select: { name: true } } },
        });
        return {
          id: item.productId,
          name: product?.name || "Unknown",
          category: product?.category?.name || "Unknown",
          sales: item._sum.quantity || 0,
          revenue: (item._sum.price || 0) * (item._sum.quantity || 1),
        };
      })
    );

    // 4. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      kpis: {
        totalRevenue: totalRevenueResult._sum.total || 0,
        ordersToday,
        newCustomers,
        lowStockItems,
      },
      chartData,
      topProducts: enrichedTopProducts,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customer: o.customer.name,
        total: o.total,
        status: o.status,
        date: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
