import NextAuth from "next-auth";
import authConfig from "@/app/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!req.auth?.user?.id;

  console.log("AUTH DEBUG:", {
    pathname: req.nextUrl.pathname,
    hasAuth: !!req.auth,
    hasUser: !!req.auth?.user,
    hasUserId: !!req.auth?.user?.id,
    hasEmail: !!req.auth?.user?.email,
    role: req.auth?.user?.role,
  });

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
