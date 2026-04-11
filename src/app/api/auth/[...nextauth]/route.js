import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

import { rateLimit } from "@/middleware/rateLimit/rateLimit";
import { singleDeviceGuard } from "@/middleware/singleDeviceGuard/singleDeviceGuard";

export const dynamic = "force-dynamic";

const limiter = () => true;
const deviceGuard = {
  check: () => true,
  register: () => {},
  release: () => {},
};

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
          const getHeader = (key) => {
            if (!req?.headers) return null;
            if (typeof req.headers.get === "function") {
              return req.headers.get(key);
            }
            return req.headers[key];
          };

          const headerApiKey = getHeader("x-api-key");

          if (!limiter(req)) {
            throw new Error("Too many login attempts.");
          }

          const apiKey = credentials?.apiKey || headerApiKey;
          if (apiKey !== process.env.API_KEY) {
            throw new Error("Unauthorized: Invalid API Key");
          }

          await connectDB();

          const user = await User.findOne({ mobile: credentials.mobile }).lean();
          if (!user) throw new Error("User not found");

          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) throw new Error("Invalid credentials");

          const now = new Date();

          await User.findByIdAndUpdate(user._id, { lastLogin: now });

          const ip =
            getHeader("x-forwarded-for")?.split(",")[0] ||
            req.ip ||
            "global";

          const userId = user._id.toString();

          if (!deviceGuard.check(userId, ip)) {
            throw new Error("Already logged in from another device");
          }

          deviceGuard.register(userId, ip);

          return {
            id: userId,
            name: user.name,
            mobile: user.mobile.toString(),
            email: user.email,
            pages: user.pages || [],
          };
        } catch (error) {
          throw error;
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
      session.user.id = token.sub;
      session.user.name = token.name;
      session.user.mobile = token.mobile;
      session.user.email = token.email;
      session.user.pages = token.pages;
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.sub) deviceGuard.release(token.sub);
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;