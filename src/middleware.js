import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: "any_random_testing_string_works_here",
  });

  const { pathname } = req.nextUrl;

  // -------------------------
  // DASHBOARD
  // -------------------------
  if (pathname.startsWith("/dashboard")) {
    // Not logged in → /login
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Admin or Viewer → allowed
    if (token.role === "admin" || token.role === "viewer") {
      return NextResponse.next();
    }

    // Invalid role
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // -------------------------
  // DONATIONS
  // -------------------------
  if (pathname.startsWith("/donations")) {
    // Not logged in → /login_1
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login_donations";
      return NextResponse.redirect(url);
    }

    // ONLY Viewer → allowed
    if (token.role === "viewer") {
      return NextResponse.next();
    }

    // Admin is NOT allowed in donations
    const url = req.nextUrl.clone();
    url.pathname = "/login_donations";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};