import { NextResponse } from "next/server";

export function applyCorsHeaders(
  response: NextResponse,
  origin: string | null,
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

export function corsCheck(
  origin: string | null,
  allowedOrigins: string[]
): NextResponse | null {
  if (!origin || allowedOrigins.includes(origin)) {
    return null;
  }
  return NextResponse.json(
    { success: false, error: { message: "CORS: Origin not allowed", code: "CORS_ERROR" } },
    { status: 403 }
  );
}
