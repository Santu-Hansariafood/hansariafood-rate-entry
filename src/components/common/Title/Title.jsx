"use client";

import React from "react";
import { motion } from "framer-motion";

const Title = ({ text }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full flex items-center justify-center"
    >
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 -z-10 rounded-2xl shadow-lg border border-white/10 dark:border-white/5"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(52,211,153,0.2) 50%, rgba(16,185,129,0.2) 100%)",
          backgroundSize: "200% 200%",
        }}
      />
      <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-center text-gray-900 dark:text-white tracking-tight py-6 drop-shadow-sm">
        {text}
      </h2>
    </motion.div>
  );
};

export default Title;
