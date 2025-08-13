"use client";
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center space-y-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-green-200 dark:border-green-700 max-w-sm w-full"
      >
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-green-400/30"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </motion.div>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-3 bg-green-100 dark:bg-green-900 rounded-full shadow-inner"
        >
          <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h3 className="text-lg font-bold text-green-700 dark:text-green-300 tracking-wide">
            Please Wait
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            We are preparing something for you.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
            Thanks for your patience.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
