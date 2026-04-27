import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.stockLog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        type: true,
        change: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate by day
    const dailyData: Record<string, { date: string; stockIn: number; stockOut: number }> = {};

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyData[dateString] = { date: displayDate, stockIn: 0, stockOut: 0 };
    }

    // Populate data
    for (const log of logs) {
      const dateString = log.createdAt.toISOString().split("T")[0];
      if (dailyData[dateString]) {
        if (log.change > 0) {
          dailyData[dateString].stockIn += log.change;
        } else {
          dailyData[dateString].stockOut += Math.abs(log.change);
        }
      }
    }

    const dataArray = Object.values(dailyData);

    return NextResponse.json(dataArray);
  } catch (error) {
    console.error("Error fetching stock movement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
