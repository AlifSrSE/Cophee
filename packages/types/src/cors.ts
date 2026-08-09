import { NextRequest, NextResponse } from "next/server";

export function corsMiddleware(
  origin: string | undefined,
  allowedOrigins: string[]
): NextResponse | undefined {
  if (!origin || allowedOrigins.includes(origin)) {
    return undefined;
  }
  return NextResponse.json(
    { success: false, error: { message: "CORS: Origin not allowed", code: "CORS_ERROR" } },
    { status: 403 }
  );
}

export function applyCorsHeaders(
  response: NextResponse,
  origin: string | undefined,
  allowedOrigins: string[]
): NextResponse {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
  }
  return response;
}
