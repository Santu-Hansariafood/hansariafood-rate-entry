"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
      refetchInterval={5 * 60}
    >
      {children}
    </SessionProvider>
  );
}
