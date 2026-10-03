import { NextResponse } from "next/server";

// Helper function to send logs to Supabase asynchronously (Edge-safe)
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

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Log EVERY request that hits this middleware automatically
  // (We'll determine the final status code below or default to 200)
  let status = 200;

  // -----------------------------
  // DASHBOARD PROTECTION
  // -----------------------------
  if (pathname.startsWith("/dashboard")) {
    const dashboardToken = req.cookies.get("dashboard_session");

    if (!dashboardToken) {
      status = 302; // Redirect/Unauthorized
      logRequestToSupabase(req, status);
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // -----------------------------
  // DONATIONS PROTECTION
  // -----------------------------
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

  // Log successful/normal requests for APIs, pages, etc.
  logRequestToSupabase(req, status);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Catch dashboard, donations, AND all API routes.
      You can also use '/:path*' to capture the entire site, 
      while excluding static assets like images/favicons.
    */
    "/dashboard/:path*",
    "/donations/:path*",
    "/api/:path*",
  ],
};