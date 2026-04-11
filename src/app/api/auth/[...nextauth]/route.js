import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" },
        apiKey: { label: "API Key", type: "text" },
      },

      async authorize(credentials, req) {
        try {
          if (!credentials?.mobile || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const apiKey = credentials.apiKey || req.headers["x-api-key"];

          if (apiKey !== process.env.API_KEY) {
            throw new Error("Invalid API Key");
          }

          await connectDB();

          const user = await User.findOne({
            mobile: credentials.mobile,
          }).lean();

          if (!user) throw new Error("User not found");

          const valid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!valid) throw new Error("Invalid credentials");

          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
          });

          return {
            id: user._id.toString(),
            name: user.name,
            mobile: user.mobile.toString(),
            email: user.email,
            pages: user.pages || [],
          };
        } catch (err) {
          console.error("AUTH ERROR:", err.message);
          throw new Error(err.message);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.mobile = user.mobile;
        token.email = user.email;
        token.pages = user.pages;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.sub,
        name: token.name,
        mobile: token.mobile,
        email: token.email,
        pages: token.pages,
      };
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
