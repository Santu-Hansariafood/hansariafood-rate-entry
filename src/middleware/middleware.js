import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ✅ Allow root path (Login page)
    if (pathname === "/") {
      return NextResponse.next();
    }

    // 🔐 Not logged in → go to login (root /)
    if (!token) {
      const loginUrl = new URL("/", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    },
  }
);

/**
 * ✅ Protect everything except public pages & assets
 */
export const config = {
  matcher: [
    "/((?!api|_next|static|favicon.ico|images|icons|logo|notification|unauthorized|forgot-password|resetpassword|privacy-policy|terms-and-conditions|broker-commission-policy|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};
