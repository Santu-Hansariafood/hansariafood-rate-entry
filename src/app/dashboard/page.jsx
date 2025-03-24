"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {session?.user?.name || "Guest"}!
      </h1>
      <p className="text-gray-600">Mobile: {session?.user?.mobile || "N/A"}</p>
      <button
        onClick={() => signOut()}
        className="mt-4 bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
