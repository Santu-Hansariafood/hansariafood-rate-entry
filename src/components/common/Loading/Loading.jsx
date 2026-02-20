"use client";
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";

const Loading = () => {
  return (
    <div className="relative flex justify-center items-center w-full min-h-screen px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-slate-950 dark:via-slate-900 dark:to-black transition-all duration-700">
      <motion.div
        className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(5,150,105,0.22),transparent_40%)]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center space-y-5 sm:space-y-6 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl px-5 py-7 sm:px-10 sm:py-10 rounded-3xl shadow-[0_8px_40px_rgba(16,185,129,0.22)] border border-emerald-100/60 dark:border-emerald-500/40 w-full max-w-xs sm:max-w-sm hover:shadow-[0_12px_45px_rgba(16,185,129,0.3)] transition-all duration-500"
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-emerald-300/20 border-t-emerald-500/80 shadow-inner"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-full shadow-inner border border-emerald-300/40 dark:border-emerald-600/50"
        >
          <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">
            Preparing Your Experience
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Please wait while we load your data securely.
          </p>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic"
          >
            Thanks for your patience.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
