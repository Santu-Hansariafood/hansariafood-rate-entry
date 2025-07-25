"use client";

import React from "react";

export default function CompanyTypeFilter({ selectedType, onChange }) {
  const options = [
    { label: "All", value: "all", color: "blue" },
    { label: "Buyer", value: "buyer", color: "green" },
    { label: "Seller", value: "seller", color: "red" },
  ];

  return (
    <div className="mb-6 flex justify-center">
      <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md text-center">
        <h2 className="text-base font-semibold text-green-500 mb-4">
          Filter by Company Type
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {options.map(({ label, value, color }) => {
            const isSelected = selectedType === value;
            return (
              <button
                key={value}
                onClick={() => onChange(value)}
                className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 border ${
                  isSelected
                    ? `bg-${color}-600 text-white border-${color}-600`
                    : `bg-white text-${color}-600 border-${color}-600 hover:bg-${color}-100`
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
