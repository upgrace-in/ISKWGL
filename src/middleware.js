import NextAuth from "next-auth";
import authConfig from "@/app/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!req.auth?.user?.id;

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  if (pathname.startsWith("/donations")) {
    const donationsToken = req.cookies.get("donations_session");

    if (!donationsToken) {
      status = 302; // Redirect/Unauthorized
      logRequestToSupabase(req, status);
      const url = req.nextUrl.clone();
      url.pathname = "/login_donations";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};