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
          className="text-gray-700 dark:text-gray-200 font-medium"
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
        className={`rounded-lg p-2 border transition focus:outline-none focus:ring-2
          ${
            readOnly
              ? "bg-gray-100 text-gray-600 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
              : "focus:ring-green-500"
          }
          border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
        `}
      />
    </div>
  );
};

export default InputBox;
