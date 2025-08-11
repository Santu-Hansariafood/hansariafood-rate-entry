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
      const selected = normalizedOptions.find((opt) => opt.value === value);
      if (selected) setSearchTerm(selected.label);
    }
  }, [value, normalizedOptions, isMulti]);

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
    <div className="flex flex-col gap-2 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
          className="w-full px-4 py-2 pr-10 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all backdrop-blur-sm"
        />
        <ChevronDown
          size={18}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isMulti && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((val, idx) => {
            const option = normalizedOptions.find((opt) => opt.value === val);
            return (
              <span
                key={idx}
                className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-700 dark:text-white shadow-sm"
              >
                {option?.label || val}
                <button
                  onClick={() => onChange(value.filter((v) => v !== val))}
                  className="ml-1 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-500 font-bold"
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
          className="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-800/95 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto z-20 mt-1 animate-fadeIn backdrop-blur-sm"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                role="option"
                aria-selected={isSelected(option.value)}
                onClick={() => handleSelect(option)}
                className={`flex items-center justify-between p-2 px-4 text-sm cursor-pointer transition-colors duration-150 rounded-lg mx-1 my-0.5
                  ${
                    isSelected(option.value)
                      ? "bg-green-200 dark:bg-green-600 text-green-900 dark:text-white"
                      : "hover:bg-green-100 dark:hover:bg-green-700 text-gray-800 dark:text-white"
                  }`}
              >
                {option.label}
                {isSelected(option.value) && (
                  <Check
                    size={16}
                    className="text-green-700 dark:text-green-300"
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
