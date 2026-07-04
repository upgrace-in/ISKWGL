import { withAuth } from "next-auth/middleware";

export default withAuth({
  // This MUST match the secret you put in route.js
  secret: "any_random_testing_string_works_here",
});

export const config = {
  matcher: ["/dashboard/:path*"],
};