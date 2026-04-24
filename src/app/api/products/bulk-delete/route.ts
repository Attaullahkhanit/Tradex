import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    await prisma.product.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return NextResponse.json({ error: "Failed to delete products" }, { status: 500 });
  }
}
