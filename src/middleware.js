import { NextResponse } from "next/server";

export function middleware(req) {
    const url = req.nextUrl;
  const { pathname } = req.nextUrl;

  // External mentoring application paths
//   if (
//       pathname.startsWith("/assets/") ||
//       pathname.startsWith("/cdn-cgi/") ||
//       pathname === "/signin-with-chatgpt" ||
//       pathname === "/favicon.svg" || pathname === "/api/auth/session" ||
//       pathname === "/api/auth/_log"
//   ) {
//       url.pathname = "/SAC" + pathname;

//       return NextResponse.rewrite(url);
//   }

//   if (pathname === "/callback") {
//     const url = req.nextUrl.clone();

//     url.pathname = "/SAC/callback";

//     return NextResponse.rewrite(url);
// }

//   // /api/mentoring → /SAC/api/mentoring
//   if (pathname === "/api/mentoring") {
//       url.pathname = "/SAC/api/mentoring";
//       return NextResponse.rewrite(url);
//   }

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
    "/cdn-cgi/:path*",
    "/assets/:path*",
    "/api/mentoring",
    "/signin-with-chatgpt",
    "/api/auth/session",
    "/api/auth/_log",
    "/favicon.svg",
    "/callback",
  ],
};