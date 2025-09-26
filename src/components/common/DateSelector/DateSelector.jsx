"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function DateSelector({
  value,
  onChange,
  label = "Select Date",
}) {
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      className="w-full flex items-center gap-3 
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
      <Calendar
        className="text-green-600 dark:text-green-400 transition-colors"
        size={22}
      />
      <label className="font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
        {label}:
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => {
          const selected = e.target.value;
          if (selected > todayISO) {
            onChange(todayISO);
          } else {
            onChange(selected);
          }
        }}
        max={todayISO}
        className="flex-1 bg-transparent focus:outline-none text-base 
                   text-gray-900 dark:text-white"
      />
    </motion.div>
  );
}
