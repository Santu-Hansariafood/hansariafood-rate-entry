"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

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
            <motion.label
              key={optionId}
              htmlFor={optionId}
              whileHover={!disabled ? { scale: 1.03 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border cursor-pointer shadow-sm backdrop-blur-md transition-all duration-300
                ${
                  isSelected
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg"
                    : "bg-white/80 dark:bg-gray-900/80 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-green-400 hover:shadow-md"
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
                className="hidden"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
