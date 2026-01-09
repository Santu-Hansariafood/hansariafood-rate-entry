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
    <div className="mt-3">
      <button
        type={type}
        onClick={onClick}
        disabled={isButtonDisabled}
        aria-busy={isLoading}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold
          transition-all duration-200 ease-out select-none
          ${
            isButtonDisabled
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed shadow-none"
              : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md active:scale-[0.98]"
          }
          ${sizeClasses[size]} ${className}`}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
        )}
        {text || children}
      </button>
    </div>
  );
};

export default Button;
