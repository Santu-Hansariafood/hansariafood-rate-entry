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
        try {
          // Helper to safely get headers
          const getHeader = (key) => {
            if (!req?.headers) return null;
            if (typeof req.headers.get === "function") {
              return req.headers.get(key);
            }
            return req.headers[key];
          };

          const headerApiKey = getHeader("x-api-key");
          
          // Log incoming request for debugging
          console.log("Auth Attempt:", { 
            mobile: credentials?.mobile, 
            hasPassword: !!credentials?.password,
            hasApiKey: !!(credentials?.apiKey || headerApiKey)
          });

          // 1. Rate Limiting
          // Note: Rate limiter might need adjustment if it expects a specific req structure
          if (!limiter(req)) {
            console.error("Auth Failed: Rate limited");
            throw new Error("Too many login attempts.");
          }

          // 2. API Key Validation
          const apiKey = credentials?.apiKey || headerApiKey;
          const expectedApiKey = process.env.API_KEY;

          if (!apiKey || apiKey !== expectedApiKey) {
            console.error("Auth Failed: Invalid API Key. Received:", apiKey ? "PROVIDED" : "MISSING", "Expected:", expectedApiKey ? "EXISTS" : "MISSING");
            throw new Error("Unauthorized: Invalid API Key");
          }

          // 3. Database Connection
          await connectDB();

          // 4. User Lookup
          const user = await User.findOne({ mobile: credentials.mobile }).lean();
          if (!user) {
            console.error("Auth Failed: User not found for mobile:", credentials.mobile);
            throw new Error("User not found");
          }

          // 5. Password Validation
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) {
            console.error("Auth Failed: Password mismatch for user:", user.name);
            throw new Error("Invalid credentials");
          }

          // 6. Device Guard
          const forwardedFor = getHeader("x-forwarded-for");
          const ip = forwardedFor?.split(",")[0] || req.ip || "global";
          const userId = user._id.toString();

          if (!deviceGuard.check(userId, ip)) {
            console.error("Auth Failed: Single device violation for:", user.name, "IP:", ip);
            throw new Error("This account is already logged in from another device.");
          }
          deviceGuard.register(userId, ip);

          console.log("Auth Success:", user.name);

          return {
            id: userId,
            name: user.name,
            mobile: user.mobile.toString(),
            pages: user.pages || [],
          };
        } catch (error) {
          console.error("Authorize Error Catch:", error.message);
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
        token.mobile = user.mobile;
        token.pages = user.pages;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.mobile = token.mobile;
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
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
