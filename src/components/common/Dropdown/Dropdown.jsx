"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

const Dropdown = ({ label, options = [], value, onChange }) => {
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
    const selected = normalizedOptions.find((opt) => opt.value === value);
    if (selected) setSearchTerm(selected.label);
  }, [value, normalizedOptions]);

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

  const handleSelect = useCallback((option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div
      className="flex flex-col gap-2 w-full max-w-xs relative"
      ref={dropdownRef}
    >
      {label && (
        <label className="text-gray-700 dark:text-gray-100 font-medium transition-colors duration-200">
          {label}
        </label>
      )}

      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="dropdown-options"
        aria-autocomplete="list"
        placeholder={`Search ${label}`}
        value={searchTerm}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />

      {isOpen && (
        <div
          id="dropdown-options"
          className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                role="option"
                className="p-2 hover:bg-green-100 dark:hover:bg-green-700 cursor-pointer text-gray-800 dark:text-white"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 dark:text-gray-400">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
