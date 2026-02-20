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
        <label className="text-xs font-semibold tracking-[0.14em] uppercase text-emerald-700 dark:text-emerald-300">
          {label}
        </label>
      )}

      <div className="flex gap-2.5 sm:gap-3 flex-wrap">
        {options.map((option, idx) => {
          const optionId = `${groupId}-${idx}`;
          const isSelected = value === option.value;

          return (
            <motion.label
              key={optionId}
              htmlFor={optionId}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={`flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-2xl border cursor-pointer shadow-sm backdrop-blur-md transition-all duration-300
                ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.45)]"
                    : "bg-white/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 hover:border-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 hover:shadow-md"
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
              <span className="text-xs sm:text-sm font-medium tracking-wide">
                {option.label}
              </span>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
