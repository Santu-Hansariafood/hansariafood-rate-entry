import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

import { rateLimit } from "@/middleware/rateLimit/rateLimit";
import { singleDeviceGuard } from "@/middleware/singleDeviceGuard/singleDeviceGuard";

const limiter = rateLimit(5, 15 * 60 * 1000);
const deviceGuard = singleDeviceGuard();

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
        if (!limiter(req)) throw new Error("Too many login attempts.");
        const apiKey = credentials?.apiKey || req.headers.get("x-api-key");
        if (apiKey !== process.env.API_KEY) {
          throw new Error("Unauthorized: Invalid API Key");
        }

        await connectDB();
        const user = await User.findOne({ mobile: credentials.mobile }).lean();
        if (!user) throw new Error("User not found");
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) throw new Error("Invalid credentials");

        const ip = req.ip || "global";
        const userId = user._id.toString();

        if (!deviceGuard.check(userId, ip)) {
          throw new Error(
            "This account is already logged in from another device."
          );
        }
        deviceGuard.register(userId, ip);

        return { id: userId, name: user.name, mobile: user.mobile.toString() };
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
        token.mobile = user.mobile;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.mobile = token.mobile;
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.sub) deviceGuard.release(token.sub);
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
