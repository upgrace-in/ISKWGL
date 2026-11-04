import NextAuth from "next-auth";
import authConfig from "@/app/lib/auth.config";
import { NextResponse } from "next/server";

async function logRequestToSupabase(req, status) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return;

  try {
    fetch(`${supabaseUrl}/rest/v1/api_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        method: req.method,
        path: req.nextUrl.pathname,
        status: status,
        duration_ms: 0
      })
    }).catch(err => console.error('Log error:', err));
  } catch (e) {
    // Fail silently so it never breaks user experience
  }
}

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  let status = 200;

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
    status = 302; // Redirect/Unauthorized
    logRequestToSupabase(req, status);
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

  logRequestToSupabase(req, status);

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donations/:path*",
  ],
};
