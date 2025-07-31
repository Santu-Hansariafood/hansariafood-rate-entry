"use client";

import React from "react";

const options = [
  { label: "All", value: "all" },
  { label: "Buyer", value: "buyer" },
  { label: "Seller", value: "seller" },
];

export default function BuyerSellerFilter({ value, onChange }) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Filter by:</span>
      <div className="flex gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-4 py-1 text-sm font-medium rounded-md transition-colors duration-200 border 
                ${isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
