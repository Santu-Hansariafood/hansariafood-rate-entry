"use client";

import React from "react";
import { motion } from "framer-motion";

const options = [
  { label: "All", value: "all", gradient: "from-blue-500 to-blue-600" },
  { label: "Buyer", value: "buyer", gradient: "from-emerald-500 to-emerald-600" },
  { label: "Seller", value: "seller", gradient: "from-rose-500 to-rose-600" },
];

export default function BuyerSellerFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide whitespace-nowrap">
        Filter:
      </span>

      <div className="relative flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full shadow-inner">
        {options.map((opt) => {
          const isSelected = value === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="relative z-10 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-200"
            >
              {isSelected && (
                <motion.span
                  layoutId="activeFilter"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${opt.gradient} shadow-md`}
                />
              )}

              <span
                className={`relative z-10 transition-colors duration-200 ${
                  isSelected
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-white"
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
