"use client";

import React from "react";

const options = [
  { label: "Buyer", value: "buyer", gradient: "from-green-500 to-green-600" },
  { label: "Seller", value: "seller", gradient: "from-red-500 to-red-600" },
];

export default function BuyerSellerFilter({ value, onChange }) {
  return (
    <div className="mt-4 flex items-center gap-4">
      <span className="text-sm font-semibold text-gray-700 tracking-wide">
        Filter by:
      </span>

      <div className="flex gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 border shadow-sm
                ${
                  isSelected
                    ? `bg-gradient-to-r ${opt.gradient} text-white border-transparent shadow-md scale-105`
                    : `bg-white text-gray-700 border-gray-300 hover:bg-gradient-to-r ${opt.gradient} hover:text-white`
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
