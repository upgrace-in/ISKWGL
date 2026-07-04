import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Inject URL for local dev
// process.env.NEXTAUTH_URL = "http://localhost:3000";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Dashboard Login",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.password === "admin123") {
          return { id: "1", name: "Admin" };
        }
        return null;
      }
    })
  ],
  secret: "any_random_testing_string_works_here",
  // Crucial: Credentials provider requires JWT strategy
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', 
  }
});

export { handler as GET, handler as POST };