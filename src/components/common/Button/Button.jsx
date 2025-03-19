"use client";

import React from "react";

const Button = ({ text, onClick, isLoading, disabled, size = "medium" }) => {
  const sizeClasses = {
    small: "px-3 py-1 text-sm",
    medium: "px-5 py-2 text-base",
    large: "px-7 py-3 text-lg",
  };

  return (
    <div className="mt-4">
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`w-full rounded-lg font-semibold transition-all duration-300 ease-in-out
          ${
            isLoading || disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-white hover:text-green-600 shadow-lg"
          } ${sizeClasses[size]}`}
      >
        {isLoading ? "Processing..." : text}
      </button>
    </div>
  );
};

export default Button;
