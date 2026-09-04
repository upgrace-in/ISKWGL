import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // -----------------------------
  // DASHBOARD
  // -----------------------------
  if (pathname.startsWith("/dashboard")) {
    const dashboardToken = req.cookies.get(
      "dashboard_session"
    );

    if (!dashboardToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // -----------------------------
  // DONATIONS
  // -----------------------------
  if (pathname.startsWith("/donations")) {
    const donationsToken = req.cookies.get(
      "donations_session"
    );

    if (!donationsToken) {
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