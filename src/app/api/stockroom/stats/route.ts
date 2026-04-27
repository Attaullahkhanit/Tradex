import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Trigger recompile
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        stock: true,
        costPrice: true,
        lowStockAlert: true,
      },
    });

    const totalSkus = products.length;
    let inventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyCount = 0;

    for (const product of products) {
      inventoryValue += (product.costPrice || 0) * product.stock;

      if (product.stock === 0) {
        outOfStockCount++;
      } else if (product.stock <= product.lowStockAlert) {
        lowStockCount++;
      } else {
        healthyCount++;
      }
    }

    return NextResponse.json({
      totalSkus,
      inventoryValue,
      lowStockCount,
      outOfStockCount,
      healthyCount,
    });
  } catch (error) {
    console.error("Error fetching stockroom stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
