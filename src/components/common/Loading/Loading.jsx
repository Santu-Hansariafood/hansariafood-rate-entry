"use client";
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";

const Loading = () => {
  return (
    <div className="relative flex justify-center items-center w-full h-screen overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-all duration-700">
      <motion.div
        className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.2),transparent_40%)]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center space-y-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_40px_rgba(16,185,129,0.2)] border border-green-200/50 dark:border-green-700/40 max-w-sm w-[90%] sm:w-full hover:shadow-[0_12px_45px_rgba(34,197,94,0.25)] transition-all duration-500"
      >
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-green-300/20 border-t-green-500/70 shadow-inner"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-900 rounded-full shadow-inner border border-green-300/40 dark:border-green-700/40"
        >
          <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold tracking-wide bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 dark:from-green-300 dark:via-emerald-400 dark:to-green-200 bg-clip-text text-transparent">
            Preparing Your Experience
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we load your data securely.
          </p>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic"
          >
            Thanks for your patience 🌿
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
