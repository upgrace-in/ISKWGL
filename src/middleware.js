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

  if (pathname.startsWith("/donations") && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/login_donations", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};
