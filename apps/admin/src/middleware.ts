import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  { pattern: /^\/$/, roles: ["OWNER", "MANAGER", "STAFF"] },
  { pattern: /^\/employees/, roles: ["OWNER"] },
  { pattern: /^\/products/, roles: ["OWNER", "MANAGER", "STAFF"] },
  { pattern: /^\/inventory/, roles: ["OWNER", "MANAGER", "STAFF"] },
  { pattern: /^\/orders/, roles: ["OWNER", "MANAGER", "STAFF"] },
  { pattern: /^\/tables/, roles: ["OWNER", "MANAGER", "STAFF"] },
  { pattern: /^\/reports/, roles: ["OWNER", "MANAGER"] },
  { pattern: /^\/audit/, roles: ["OWNER"] },
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    const userRole = token.role as string;
    for (const route of protectedRoutes) {
      if (route.pattern.test(request.nextUrl.pathname)) {
        if (!route.roles.includes(userRole)) {
          return NextResponse.redirect(new URL("/", request.url));
        }
        break;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
