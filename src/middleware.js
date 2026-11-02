import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
const AUTH_SECRET = process.env.AUTH_SECRET;

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const sessionToken = await getToken({ 
    req, 
    secret: AUTH_SECRET 
  });

  // -----------------------------
  // DASHBOARD PROTECTION
  // -----------------------------
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
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
    if (!sessionToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/login_donations";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};