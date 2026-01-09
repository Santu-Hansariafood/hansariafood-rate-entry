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
      className="w-full flex items-center gap-3 bg-white/90 dark:bg-gray-900/80
                 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-sm
                 backdrop-blur-sm transition-all duration-200
                 hover:border-emerald-500/70 hover:shadow-md"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Calendar
        className="text-emerald-500 dark:text-emerald-400 transition-colors flex-shrink-0"
        size={20}
      />
      <label className="font-medium whitespace-nowrap text-gray-700 dark:text-gray-200 text-sm">
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
        className="flex-1 bg-transparent focus:outline-none text-sm sm:text-base 
                   text-gray-900 dark:text-white"
      />
    </motion.div>
  );
}
