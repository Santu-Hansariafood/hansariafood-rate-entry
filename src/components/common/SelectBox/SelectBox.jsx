"use client";

import React, { useId } from "react";

export default function SelectBox({
  label,
  name,
  options = [],
  value,
  onChange,
  required = false,
  disabled = false,
}) {
  const groupId = useId();

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}

      <div className="flex flex-wrap gap-4">
        {options.map((option, idx) => {
          const optionId = `${groupId}-${idx}`;
          const isSelected = value === option.value;

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm
                ${
                  isSelected
                    ? "bg-green-100 dark:bg-green-800 border-green-500 text-green-700 dark:text-green-300"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="accent-green-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
