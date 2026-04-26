import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Standard for Next.js Middleware

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;

  const isPublicPath = path === "/login" || path === "/signup" || path === "/";
  const isDashboardPath = path.startsWith("/dashboard");

  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      // THIS IS WHERE YOU USE YOUR JWT_SECRET
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      // If they are logged in, don't let them go to Login/Signup
      if (isPublicPath && path !== "/") {
         return NextResponse.redirect(new URL("/dashboard/products", request.url));
      }
    } catch (error) {
      // If the secret is wrong or token is expired, kick them out
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*"],
};