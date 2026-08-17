import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cophee/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const orderNumber = searchParams.get("orderNumber");

    if (!phone && !orderNumber) {
      return NextResponse.json({ error: "Phone or order number required" }, { status: 400 });
    }

    const where: {
      customerPhone?: string;
      orderNumber?: string;
    } = {};

    if (phone) {
      where.customerPhone = phone;
    }

    if (orderNumber) {
      where.orderNumber = orderNumber;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        table: {
          select: {
            number: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
