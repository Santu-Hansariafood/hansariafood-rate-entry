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
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={name || inputId}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
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
        className={`w-full px-4 py-2 text-sm rounded-xl 
          border border-green-500/30 dark:border-green-400/30
          shadow-sm backdrop-blur-md
          transition-all duration-200
          ${
            readOnly
              ? "bg-gray-100/70 dark:bg-gray-800/60 text-gray-500 cursor-not-allowed"
              : `bg-white/80 dark:bg-gray-900/70 text-gray-900 dark:text-white 
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                 hover:border-green-500/60`
          }
          placeholder-gray-400 dark:placeholder-gray-500
        `}
      />
    </div>
  );
};

export default InputBox;
