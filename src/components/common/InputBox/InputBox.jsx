"use client";

import React, { useId } from "react";

const InputBox = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  readOnly = false,
}) => {
  const inputId = useId();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={name || inputId}
          className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <input
        id={name || inputId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border
          shadow-xs bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm
          transition-all duration-200 outline-none
          placeholder-gray-400 dark:placeholder-gray-500
          ${
            readOnly
              ? "border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/60 hover:border-emerald-400/80"
          }`}
      />
    </div>
  );
};

export default InputBox;
