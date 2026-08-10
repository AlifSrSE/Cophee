import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cophee/database";
import { ApiResponseSchema } from "@cophee/types";
import { applyCorsHeaders, corsCheck } from "@/lib/cors";
import { getRateLimitIdentifier, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = (process.env.ADMIN_CORS_ORIGINS ?? "").split(",").map((o) => o.trim());

  const corsError = corsCheck(origin, allowedOrigins);
  if (corsError) return corsError;

  const identifier = getRateLimitIdentifier(request);
  const limitResult = rateLimit(identifier, 60, 60000);

  if (!limitResult.success) {
    const response = NextResponse.json(
      ApiResponseSchema.parse({
        success: false,
        error: {
          message: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
        },
      }),
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
    applyCorsHeaders(response, origin, allowedOrigins);
    return response;
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageKey: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    const response = NextResponse.json(
      ApiResponseSchema.parse({
        success: true,
        data: categories,
      }),
      {
        headers: {
          "X-RateLimit-Remaining": limitResult.remaining.toString(),
          "X-RateLimit-Reset": new Date(limitResult.resetAt).toISOString(),
        },
      }
    );

    applyCorsHeaders(response, origin, allowedOrigins);
    return response;
  } catch {
    const response = NextResponse.json(
      ApiResponseSchema.parse({
        success: false,
        error: {
          message: "Failed to fetch menu",
          code: "MENU_FETCH_ERROR",
        },
      }),
      { status: 500 }
    );
    applyCorsHeaders(response, origin, allowedOrigins);
    return response;
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = (process.env.ADMIN_CORS_ORIGINS ?? "").split(",").map((o) => o.trim());

  const response = new NextResponse(null, { status: 204 });
  applyCorsHeaders(response, origin, allowedOrigins);
  return response;
}
