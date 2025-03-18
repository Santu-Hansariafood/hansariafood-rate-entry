"use client";

import React from "react";

const Button = ({ text, onClick, isLoading, disabled }) => {
  return (
    <div className="mt-4">
      {" "}
      {/* Added margin to create spacing */}
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`w-full py-2 rounded-lg text-white transition ${
          isLoading || disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isLoading ? "Processing..." : text}
      </button>
    </div>
  );
};

export default Button;
