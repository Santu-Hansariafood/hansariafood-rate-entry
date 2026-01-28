"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/common/Loading/Loading";
import { ADMINS } from "@/config/navigation";

const PUBLIC_PATHS = [
  "/",
  "/unauthorized",
  "/forgot-password",
  "/resetpassword",
  "/api",
  "/_next",
  "/favicon.ico",
];

const AuthWrapper = ({ children, allowedRoles }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (
      PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      )
    ) {
      if (session && pathname === "/") {
        router.replace("/dashboard");
      }
      return;
    }

    if (!session) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session?.expires && new Date(session.expires) < new Date()) {
      signOut({ redirect: false }).then(() => {
        window.location.href = "/";
      });
      return;
    }

    if (
      allowedRoles &&
      session.user?.role &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.replace("/unauthorized");
      return;
    }

    const userMobile = session.user?.mobile;
    const userPages = session.user?.pages || [];
    const isAdmin = ADMINS.includes(userMobile);

    if (!isAdmin) {
      const isAllowed = userPages.some(
        (page) => pathname === page || pathname.startsWith(page + "/")
      );
      
      if (pathname !== "/" && pathname !== "/dashboard" && !isAllowed) {
         router.replace("/unauthorized");
      }
    }
  }, [status, session, router, pathname, allowedRoles]);

  if (status === "loading") return <Loading />;

  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
  ) {
    return children;
  }

  if (!session) return null;
  if (
    allowedRoles &&
    session.user?.role &&
    !allowedRoles.includes(session.user.role)
  ) {
    return null;
  }

  const userMobile = session.user?.mobile;
  const userPages = session.user?.pages || [];
  const isAdmin = ADMINS.includes(userMobile);
  
  if (!isAdmin && pathname !== "/") {
     if (pathname === "/dashboard") return children;

     const isAllowed = userPages.some(
        (page) => pathname === page || pathname.startsWith(page + "/")
      );
     if (!isAllowed) return null;
  }

  return children;
};

export default AuthWrapper;
