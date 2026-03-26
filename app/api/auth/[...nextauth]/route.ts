import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            console.log("Creating new Google user:", user.email);
            await User.create({
              name: user.name,
              email: user.email,
              provider: "google",
              providerId: user.id,
            });
          } else {
            console.log("Updating existing user for Google:", user.email);
            if (existingUser.provider !== "google") {
              existingUser.provider = "google";
              existingUser.providerId = user.id;
              await existingUser.save();
            }
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          throw error;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.userId = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
