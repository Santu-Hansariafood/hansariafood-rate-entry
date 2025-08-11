"use client";

import React from "react";

export default function CompanyTypeFilter({ selectedType, onChange }) {
  const options = [
    { label: "All", value: "all", gradient: "from-blue-500 to-blue-600" },
    { label: "Buyer", value: "buyer", gradient: "from-green-500 to-green-600" },
    { label: "Seller", value: "seller", gradient: "from-red-500 to-red-600" },
  ];

  return (
    <div className="mb-6 flex justify-center">
      <div className="bg-white/70 backdrop-blur-lg shadow-lg rounded-2xl p-6 w-full max-w-md text-center border border-gray-200">
        <h2 className="text-lg font-bold text-green-600 mb-5 tracking-wide">
          Filter by Company Type
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {options.map(({ label, value, gradient }) => {
            const isSelected = selectedType === value;
            return (
              <button
                key={value}
                onClick={() => onChange(value)}
                className={`px-5 py-2.5 text-sm font-medium rounded-full shadow-sm transition-all duration-300
                  ${
                    isSelected
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105`
                      : `bg-white text-gray-700 border border-gray-300 hover:bg-gradient-to-r ${gradient} hover:text-white`
                  }
                `}
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
