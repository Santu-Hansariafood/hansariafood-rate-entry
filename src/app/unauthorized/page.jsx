"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-green-200 dark:border-gray-700"
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <ShieldAlert className="w-14 h-14 text-red-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don’t have permission to access this page. Please contact the
          administrator if you think this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl
                       bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                       text-gray-800 dark:text-gray-100 transition"
          >
            <ArrowLeft size={18} /> Go Back
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700
                       text-white transition shadow-md"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
