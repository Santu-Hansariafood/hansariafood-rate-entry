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
      className="mb-4 w-full flex items-center gap-2 bg-white border border-green-500 dark:bg-gray-800 dark:border-green-600 rounded-full px-4 py-2 shadow-sm"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Search className="text-green-600 dark:text-green-400" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-white"
      />
    </motion.div>
  );
}
