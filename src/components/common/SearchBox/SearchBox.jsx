"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`
        mb-6 w-full flex items-center gap-3
        rounded-2xl px-5 py-3
        bg-white/70 dark:bg-gray-900/60
        backdrop-blur-md
        border
        transition-all duration-300
        ${
          focused
            ? "border-green-500 ring-2 ring-green-400/30 shadow-lg shadow-green-200/50 dark:shadow-green-500/20"
            : "border-green-500/30 dark:border-green-400/20 shadow-md"
        }
      `}
    >
      <motion.span
        animate={{ scale: focused ? 1.1 : 1, rotate: focused ? -5 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center"
      >
        <Search
          size={22}
          className={`transition-colors ${
            focused ? "text-green-600 dark:text-green-400" : "text-green-500"
          }`}
        />
      </motion.span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="
          w-full bg-transparent focus:outline-none
          text-base text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          font-medium
        "
      />
    </motion.div>
  );
}
