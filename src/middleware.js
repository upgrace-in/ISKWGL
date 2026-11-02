import { auth } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  console.log("Middleware Auth check - User:", req.auth?.user);
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

  console.log("Middleware Auth check - User:", req.auth?.user);

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};