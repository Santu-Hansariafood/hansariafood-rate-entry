"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronDown, Check, X } from "lucide-react";

const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  isMulti = false,
  placeholder = "Search...",
  clearOnEmpty = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string" ? { label: option, value: option } : option
      ),
    [options]
  );

  const filteredOptions = useMemo(() => {
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, normalizedOptions]);

  useEffect(() => {
    if (isMulti && Array.isArray(value)) {
      setSearchTerm("");
    } else {
      if (clearOnEmpty && (value === null || value === undefined || value === "")) {
        setSearchTerm("");
      } else {
        const selected = normalizedOptions.find((opt) => opt.value === value);
        if (selected) setSearchTerm(selected.label);
      }
    }
  }, [value, normalizedOptions, isMulti, clearOnEmpty]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback(
    (option) => {
      if (isMulti) {
        if (Array.isArray(value)) {
          const alreadySelected = value.includes(option.value);
          const updatedValues = alreadySelected
            ? value.filter((v) => v !== option.value)
            : [...value, option.value];
          onChange(updatedValues);
        } else {
          onChange([option.value]);
        }
      } else {
        onChange(option.value);
        setSearchTerm(option.label);
        setIsOpen(false);
      }
    },
    [onChange, value, isMulti]
  );

  const isSelected = useCallback(
    (optionValue) => {
      if (isMulti && Array.isArray(value)) {
        return value.includes(optionValue);
      }
      return value === optionValue;
    },
    [value, isMulti]
  );

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-300 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="dropdown-options"
          aria-autocomplete="list"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3.5 py-2 pr-9 text-sm rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white/95 dark:bg-gray-900/85 text-gray-900 dark:text-white 
                     placeholder-gray-400 dark:placeholder-gray-500 shadow-xs
                     focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-500
                     hover:border-emerald-400/70 transition-all duration-200 backdrop-blur-sm"
        />
        <ChevronDown
          size={18}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isMulti && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((val, idx) => {
            const option = normalizedOptions.find((opt) => opt.value === val);
            return (
              <span
                key={idx}
                className="flex items-center bg-emerald-50 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-emerald-700/70 dark:text-white shadow-sm"
              >
                {option?.label || val}
                <button
                  onClick={() => onChange(value.filter((v) => v !== val))}
                  className="ml-1 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-400 font-bold"
                  aria-label="Remove selection"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      {isOpen && (
        <div
          id="dropdown-options"
          className="absolute top-full left-0 w-full bg-white/98 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-52 overflow-y-auto z-20 mt-1 backdrop-blur-sm"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                role="option"
                aria-selected={isSelected(option.value)}
                onClick={() => handleSelect(option)}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors duration-150 rounded-lg mx-1 my-0.5
                  ${
                    isSelected(option.value)
                      ? "bg-emerald-100 dark:bg-emerald-700/70 text-emerald-900 dark:text-white"
                      : "hover:bg-emerald-50 dark:hover:bg-emerald-800/60 text-gray-800 dark:text-gray-100"
                  }`}
              >
                {option.label}
                {isSelected(option.value) && (
                  <Check
                    size={16}
                    className="text-emerald-600 dark:text-emerald-200"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 dark:text-gray-400 text-sm text-center">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
