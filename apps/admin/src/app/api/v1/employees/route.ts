import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cophee/database";
import { auth } from "@/lib/auth";
import { hash } from "argon2";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, roleId, password } = body;

    const passwordHash = await hash(password || "changeme");

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        roleId,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        hireDate: new Date(),
        isActive: true,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
