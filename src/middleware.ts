import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Note: Ensure your login API is setting the cookie named "auth_token"
  const token = request.cookies.get("auth_token")?.value;

  const isPublicPath = path === "/login" || path === "/signup" || path === "/";
  const isDashboardPath = path.startsWith("/dashboard");

  // If user is logged in and tries to access login/signup, send to dashboard
  if (isPublicPath && token) {
    if (path === "/login" || path === "/signup") {
      return NextResponse.redirect(new URL("/dashboard/products", request.url));
    }
  }

  // If user is NOT logged in and tries to access the dashboard, send to login
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// This tells Next.js which routes to run this code on
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
  ],
};