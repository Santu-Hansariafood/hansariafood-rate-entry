"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = ({ children, allowedRoles }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session?.expires && new Date(session.expires) < new Date()) {
      signOut({ callbackUrl: "/login" });
      return;
    }

    if (
      allowedRoles &&
      session.user?.role &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.replace("/unauthorized");
    }
  }, [status, session, router, pathname, allowedRoles]);
  if (status === "loading") return <Loading />;
  if (!session) return null;
  if (
    allowedRoles &&
    session.user?.role &&
    !allowedRoles.includes(session.user.role)
  ) {
    return null;
  }

  return children;
};

export default AuthWrapper;
