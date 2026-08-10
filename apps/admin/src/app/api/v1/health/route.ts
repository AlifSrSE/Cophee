import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cophee/database";
import { ApiResponseSchema, type HealthResponse } from "@cophee/types";
import { applyCorsHeaders, corsCheck } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = (process.env.ADMIN_CORS_ORIGINS ?? "").split(",").map((o) => o.trim());

  const corsError = corsCheck(origin, allowedOrigins);
  if (corsError) return corsError;

  let dbStatus: "up" | "down" = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "up";
  } catch {
    dbStatus = "down";
  }

  const health: HealthResponse = {
    status: dbStatus === "up" ? "ok" : "down",
    services: {
      database: dbStatus,
    },
    timestamp: new Date().toISOString(),
  };

  const response = NextResponse.json(
    ApiResponseSchema.parse({
      success: health.status === "ok",
      data: health,
    }),
    {
      status: health.status === "ok" ? 200 : 503,
    }
  );

  applyCorsHeaders(response, origin, allowedOrigins);
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = (process.env.ADMIN_CORS_ORIGINS ?? "").split(",").map((o) => o.trim());

  const response = new NextResponse(null, { status: 204 });
  applyCorsHeaders(response, origin, allowedOrigins);
  return response;
}
