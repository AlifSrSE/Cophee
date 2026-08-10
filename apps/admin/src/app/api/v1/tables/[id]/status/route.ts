import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cophee/database";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const table = await prisma.table.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error updating table status:", error);
    return NextResponse.json({ error: "Failed to update table status" }, { status: 500 });
  }
}
