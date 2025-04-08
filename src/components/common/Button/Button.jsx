"use client";

import React from "react";

const Button = ({
  text,
  onClick,
  isLoading = false,
  disabled = false,
  size = "medium",
  type = "button",
  children,
  className = "",
}) => {
  const sizeClasses = {
    small: "px-3 py-1 text-sm",
    medium: "px-5 py-2 text-base",
    large: "px-7 py-3 text-lg",
  };

  const isButtonDisabled = isLoading || disabled;

  return (
    <div className="mt-4">
      <button
        type={type}
        onClick={onClick}
        disabled={isButtonDisabled}
        aria-busy={isLoading}
        className={`w-full flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 ease-in-out
          ${isButtonDisabled
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-green-500 text-white hover:bg-white hover:text-green-600 shadow-lg"}
          ${sizeClasses[size]} ${className}`}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {text || children}
      </button>
    </div>
  );
};

export default Button;
