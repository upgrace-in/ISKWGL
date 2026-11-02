import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await dbConnect();
        const email = user.email.toLowerCase().trim();
        const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();

        // Auto-bootstrap initial admin via environment variable
        if (initialAdminEmail && email === initialAdminEmail) {
          await User.findOneAndUpdate(
            { email },
            { name: user.name || "Admin User", role: "admin" },
            { upsert: true, new: true }
          );
          return true;
        }

        // Check if user exists in MongoDB database
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          console.warn(`[NextAuth] Blocked unauthorized login attempt: ${email}`);
          return false; // Block unauthorized users
        }

        return true;
    },
    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        token.role = dbUser ? dbUser.role : "viewer";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import dbConnect from "@/app/lib/dbConnect";
// import User from "@/models/User";

// export const { 
//   handlers: { GET, POST }, 
//   auth, 
//   signIn, 
//   signOut 
// } = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
//   callbacks: {
//     async signIn({ user }) {
//       if (!user?.email) return false;

//       try {
//         await dbConnect();
//         const email = user.email.toLowerCase().trim();
//         const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();

//         // Auto-bootstrap initial admin via environment variable
//         if (initialAdminEmail && email === initialAdminEmail) {
//           await User.findOneAndUpdate(
//             { email },
//             { name: user.name || "Admin User", role: "admin" },
//             { upsert: true, new: true }
//           );
//           return true;
//         }

//         // Check if user exists in MongoDB database
//         const existingUser = await User.findOne({ email });
//         if (!existingUser) {
//           console.warn(`[NextAuth] Blocked unauthorized login attempt: ${email}`);
//           return false; // Block unauthorized users
//         }

//         return true;
//       } catch (error) {
//         console.error("[NextAuth] Sign-in callback error:", error);
//         return false;
//       }
//     },
//     async jwt({ token, user }) {
//       try {
//         if (user && token?.email) {
//           await dbConnect();
//           const dbUser = await User.findOne({ email: token.email.toLowerCase().trim() });
//           token.role = dbUser ? dbUser.role : "viewer";
//         }
//       } catch (error) {
//         console.error("[NextAuth] JWT callback error:", error);
//         token.role = "viewer"; // Fallback role
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.role = token.role || "viewer";
//       }
//       return session;
//     },
//   },
// });