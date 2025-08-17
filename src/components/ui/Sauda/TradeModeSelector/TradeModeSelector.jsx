"use client";

import React from "react";

export default function TradeModeSelector({ onSelect }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 dark:bg-black/70">
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg max-w-sm text-center space-y-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Select Trade Mode
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onSelect("buying")}
            className="rounded bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Buying
          </button>
          <button
            onClick={() => onSelect("selling")}
            className="rounded bg-green-600 dark:bg-green-500 px-4 py-2 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Selling
          </button>
        </div>
      </div>
    </div>
  );
}
