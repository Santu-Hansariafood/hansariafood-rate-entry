"use client";

import React from "react";

const options = [
  { label: "All", value: "all", gradient: "from-blue-500 to-blue-600" },
  { label: "Buyer", value: "buyer", gradient: "from-green-500 to-green-600" },
  { label: "Seller", value: "seller", gradient: "from-red-500 to-red-600" },
];

export default function BuyerSellerFilter({ value, onChange }) {
  return (
    <div className="mt-4 flex items-center gap-4 flex-wrap justify-center">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
        Filter by:
      </span>

      <div className="flex gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 border-2 shadow-sm
                ${
                  isSelected
                    ? `bg-gradient-to-r ${opt.gradient} text-white border-transparent shadow-lg scale-105 transform`
                    : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gradient-to-r ${opt.gradient} hover:text-white hover:border-transparent hover:shadow-md hover:scale-102`
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
