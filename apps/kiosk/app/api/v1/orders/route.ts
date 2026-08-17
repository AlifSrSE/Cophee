import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cophee/database";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, source, tableId, paymentMethod, notes, items } = body;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        source: source || "DINE_IN",
        tableId,
        paymentMethod,
        notes,
        items: items?.length > 0 ? {
          create: items.map((item: { productId: string; quantity: number; unitPrice: number; notes?: string }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes,
          })),
        } : undefined,
      },
      include: {
        table: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
