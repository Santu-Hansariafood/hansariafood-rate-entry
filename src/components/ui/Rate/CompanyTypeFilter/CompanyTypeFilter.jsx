"use client";

import Loading from "@/components/common/Loading/Loading";
import React, { Suspense } from "react";

export default function CompanyTypeFilter({ selectedType, onChange }) {
  const options = [
    { label: "Buyer", value: "buyer", gradient: "from-green-500 to-green-600" },
    { label: "Seller", value: "seller", gradient: "from-red-500 to-red-600" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="mb-0 flex justify-center">
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-lg shadow-lg rounded-xl p-3 w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
            Filter by
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {options.map(({ label, value, gradient }) => {
              const isSelected = selectedType === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange(value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm transition-all duration-300
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
    </Suspense>
  );
}
