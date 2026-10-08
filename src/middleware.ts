import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookie
  const sessionCookie = request.cookies.get("smart_triage_session");
  let userSession: { userId?: string; role?: string } | null = null;

  if (sessionCookie?.value) {
    try {
      userSession = JSON.parse(sessionCookie.value);
    } catch {
      userSession = null;
    }
  }

  const isAuthenticated = !!userSession?.userId;
  const userRole = userSession?.role || "";

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/intake") ||
    pathname.startsWith("/red-alert");

  const isAuthPath = pathname.startsWith("/auth");

  // If accessing a protected route without being authenticated, redirect to /auth
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/auth", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctor/:path*",
    "/intake/:path*",
    "/red-alert/:path*",
    "/auth",
  ],
};

