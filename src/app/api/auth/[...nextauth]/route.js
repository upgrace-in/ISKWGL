import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Inject URL for local dev
// process.env.NEXTAUTH_URL = "http://localhost:3000";

const adminPassword = process.env.Dashboard_ADMIN_PASSWORD;
const viewerPassword = process.env.Dashboard_VIEWER_PASSWORD;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Dashboard Login",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Full access user
        if (credentials?.password === adminPassword) {
          return { id: "1", name: "Admin", role: "admin" };
        }
        // View-only user
        if (credentials?.password === viewerPassword) {
          return { id: "2", name: "Viewer", role: "viewer" };
        }
        // If credentials are not valid, return null
        return null;
      }
    })
  ],
  secret: "any_random_testing_string_works_here",
  session: {
    // Crucial: Credentials provider requires JWT strategy
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to the token right after sign in
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to the session object
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/login', 
  }
});

export { handler as GET, handler as POST };