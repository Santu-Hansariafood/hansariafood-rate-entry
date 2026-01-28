"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import Loading from "../../Loading/Loading";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    localStorage.clear();

    await signOut({
      redirect: false,
    });
    
    window.location.href = "/";
  };

  return (
    <Suspense fallback={<Loading />}>
      <motion.button
        onClick={handleLogout}
        disabled={loading}
        whileHover={{
          scale: 1.04,
          boxShadow: "0 0 12px rgba(239,68,68,0.45)",
        }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <LogOut size={18} />
        {loading ? "Logging out..." : "Logout"}
      </motion.button>
    </Suspense>
  );
}
