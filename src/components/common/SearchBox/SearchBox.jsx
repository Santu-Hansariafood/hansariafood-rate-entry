"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <motion.div
      className="mb-6 w-full flex items-center gap-3 
                 bg-white/70 dark:bg-gray-900/60 
                 border border-green-500/30 dark:border-green-400/20 
                 rounded-2xl px-5 py-3 shadow-lg 
                 backdrop-blur-md transition-all duration-300
                 hover:border-green-500 dark:hover:border-green-400
                 hover:shadow-green-200/50 dark:hover:shadow-green-500/20"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Search
        className="text-green-600 dark:text-green-400 transition-colors"
        size={22}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent focus:outline-none text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
    </motion.div>
  );
}
