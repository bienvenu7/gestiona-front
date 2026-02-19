// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const hasRefresh = req.cookies.get("app_token");
  const hasAccess = req.cookies.get("accessToken");

  const publicRoutes = ["/login", "/register", "/otp"];

  if (
    !hasRefresh &&
    !hasAccess &&
    req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    (hasRefresh || hasAccess) &&
    publicRoutes.includes(req.nextUrl.pathname)
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*"],
};
