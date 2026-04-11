import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// 🚨 IMPORTANT for Next.js 16
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const authOptions = {
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

          // ✅ API KEY CHECK
          const apiKey =
            credentials.apiKey ||
            req?.headers?.get?.("x-api-key") ||
            req?.headers?.["x-api-key"];

          if (apiKey !== process.env.API_KEY) {
            throw new Error("Unauthorized: Invalid API Key");
          }

          // ✅ DB CONNECT
          await connectDB();

          // ✅ FIND USER
          const user = await User.findOne({
            mobile: credentials.mobile,
          }).lean();

          if (!user) throw new Error("User not found");

          // ✅ PASSWORD CHECK
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) throw new Error("Invalid credentials");

          // ✅ UPDATE LOGIN TIME
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
          });

          // ✅ RETURN USER
          return {
            id: user._id.toString(),
            name: user.name,
            mobile: user.mobile.toString(),
            email: user.email,
            pages: user.pages || [],
          };
        } catch (error) {
          console.error("AUTH ERROR:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
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
      if (token) {
        session.user = {
          id: token.sub,
          name: token.name,
          mobile: token.mobile,
          email: token.email,
          pages: token.pages,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ SAFE HANDLER WRAPPER (Fixes Next.js 16 issue)
const handler = async (req, res) => {
  return await NextAuth(authOptions)(req, res);
};

export { handler as GET, handler as POST };