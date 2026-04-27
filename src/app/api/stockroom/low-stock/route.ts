import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: 20, // Give some buffer or use raw conditions
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockAlert: true,
      },
      orderBy: {
        stock: "asc",
      },
      take: 5,
    });

    // Actually, we want items closest to 0. The orderBy: { stock: 'asc' } handles this.
    // Ensure we only return items that are actually low stock based on their threshold if possible, 
    // or just the lowest absolute stock. Let's just return the lowest absolute stock since that's critical.

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching low stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
