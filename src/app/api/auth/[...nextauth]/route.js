import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/middleware/rateLimit";

const limiter = rateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

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
        // Rate limiting
        if (!limiter(req)) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const apiKey =
          credentials?.apiKey ||
          req?.headers?.get("x-api-key") ||
          req?.body?.apiKey;

        if (apiKey !== process.env.API_KEY) {
          throw new Error("Unauthorized: Invalid API Key");
        }

        if (!credentials?.mobile || !credentials?.password) {
          throw new Error("Mobile number and password are required");
        }

        try {
          await connectDB();
          const user = await User.findOne({ mobile: credentials.mobile }).lean();

          if (!user) throw new Error("User not found");

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) throw new Error("Invalid credentials");

          return { 
            id: user._id.toString(), 
            name: user.name, 
            mobile: user.mobile.toString() 
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };