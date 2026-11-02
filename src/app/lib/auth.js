import NextAuth from "next-auth";
import authConfig from "./auth.config";

import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  callbacks: {
    ...authConfig.callbacks,

    // Check whether the Google email exists in MongoDB.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      if (!profile?.email || profile.email_verified !== true) {
        return false;
      }

      await dbConnect();

      const user = await User.findOne({
        email: profile.email.toLowerCase(),
      });

      return !!user;
    },

    // Fetch the user's database ID and role.
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        await dbConnect();

        const user = await User.findOne({
          email: profile.email.toLowerCase(),
        }).select("_id name email role");

        if (user) {
          token.id = user._id.toString();
          token.role = user.role;
          token.name = user.name;
          token.email = user.email;
        }
      }

      return token;
    },
  },
});