import { NextResponse } from "next/server";
import { prisma } from "@cophee/database";

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
