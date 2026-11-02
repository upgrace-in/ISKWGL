import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: any }) {
      if (!user?.email) return false;

      try {
        // Dynamically import Mongoose/DB only inside the server execution phase
        const dbConnect = (await import("@/app/lib/dbConnect")).default;
        const User = (await import("@/models/User")).default;

        await dbConnect();
        const email = user.email.toLowerCase().trim();
        const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();

        // Auto-bootstrap initial admin via environment variable
        if (initialAdminEmail && email === initialAdminEmail) {
          await (User as any).findOneAndUpdate(
            { email },
            { name: user.name || "Admin User", role: "admin" },
            { upsert: true, new: true }
          );
          return true;
        }

        // Check if user exists in MongoDB database
        const existingUser = await (User as any).findOne({ email });
        if (!existingUser) {
          console.warn(`[NextAuth] Blocked unauthorized login attempt: ${email}`);
          return false;
        }

        return true;
      } catch (error) {
        console.error("[NextAuth] Sign-in callback error:", error);
        return false;
      }
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user || token?.email) {
        try {
          const dbConnect = (await import("@/app/lib/dbConnect")).default;
          const User = (await import("@/models/User")).default;

          await dbConnect();
          const targetEmail = (user?.email || token.email).toLowerCase().trim();
          token.email = targetEmail;
          
          const dbUser = await (User as any).findOne({ email: targetEmail });
          token.role = dbUser ? dbUser.role : "viewer";
        } catch (error) {
          console.error("[NextAuth] JWT database lookup error:", error);
          token.role = "viewer";
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role || "viewer";
        session.user.email = token.email || session.user.email;
      }
      return session;
    },
  },
});