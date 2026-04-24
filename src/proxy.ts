import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/signup" || path === "/";
  
  // Define dashboard paths that REQUIRE authentication
  const isDashboardPath = path.startsWith("/dashboard");

  // If user is on a public path and has a token, redirect to dashboard
  if (isPublicPath && token) {
    // Only redirect if they are on login or signup (homepage might be okay)
    if (path === "/login" || path === "/signup") {
      return NextResponse.redirect(new URL("/dashboard/products", request.url));
    }
  }

  // If user is on a dashboard path and has no token, redirect to login
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
  ],
};
