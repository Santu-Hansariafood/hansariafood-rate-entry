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
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="flex gap-4 flex-wrap">
        {options.map((option, idx) => {
          const optionId = `${groupId}-${idx}`;
          const isSelected = value === option.value;

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all duration-200 shadow
                ${
                  isSelected
                    ? "bg-green-600 text-white border-green-700 ring-2 ring-green-400"
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
                className="accent-green-600 h-4 w-4"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
