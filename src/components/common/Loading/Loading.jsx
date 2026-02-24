"use client";
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";

const Loading = () => {
  return (
    <div className="relative flex justify-center items-center w-full min-h-screen px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-slate-950 dark:via-slate-900 dark:to-black transition-all duration-700">
      <motion.div
        className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_40%)]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center space-y-5 sm:space-y-6 bg-white/80 dark:bg-slate-950/70 backdrop-blur-2xl px-6 py-7 sm:px-10 sm:py-9 rounded-3xl shadow-[0_18px_60px_rgba(16,185,129,0.28)] border border-emerald-100/70 dark:border-emerald-500/50 w-full max-w-xs sm:max-w-sm"
      >
        <div className="flex flex-col items-center space-y-1">
          <span className="text-[11px] tracking-[0.35em] uppercase text-emerald-600/80 dark:text-emerald-300/80">
            Hansaria Food
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Market Intelligence Platform
          </span>
        </div>
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-emerald-200/70 dark:border-emerald-500/40"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 dark:from-emerald-500 dark:via-emerald-400 dark:to-emerald-300 shadow-lg shadow-emerald-500/40 flex items-center justify-center"
          >
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 p-2 rounded-full bg-white dark:bg-slate-900 shadow-md border border-emerald-100/70 dark:border-emerald-500/50"
          >
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full text-center space-y-2"
        >
          <h3 className="text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 dark:from-emerald-200 dark:via-emerald-300 dark:to-emerald-100 bg-clip-text text-transparent">
            Loading your market insights
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            We are securely preparing the latest rates and freight data for you.
          </p>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 italic"
          >
            Optimising your experience with Hansaria Food.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full mt-1 h-1 rounded-full bg-emerald-50/80 dark:bg-slate-800 overflow-hidden"
        >
          <motion.div
            className="h-full w-1/2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"
            animate={{ x: ["-60%", "110%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
