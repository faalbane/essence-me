import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/train"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes — client-side auth will handle redirect,
  // but we can add cookie-based check later for SSR protection
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    // For now, let client-side auth handle protection
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/train/:path*"],
};
