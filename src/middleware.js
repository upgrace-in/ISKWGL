import { auth } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // -----------------------------
  // DASHBOARD PROTECTION
  // -----------------------------
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // -----------------------------
  // DONATIONS PROTECTION
  // -----------------------------
  if (pathname.startsWith("/donations")) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/login_donations";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};