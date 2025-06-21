"use client";
import React, { memo } from "react";
import { motion } from "framer-motion";

const Loading = memo(() => {
  return (
    <div className="flex justify-center items-center min-h-[200px] bg-gradient-to-br from-green-50 to-green-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-green-500/20"
          >
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold text-gray-800">Loading...</h3>
          <p className="text-sm text-gray-600">
            Please wait while we process your request
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;