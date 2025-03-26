"use client";

import React, { useState, useEffect } from "react";

const Dropdown = ({ label, options = [], value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  const filteredOptions = normalizedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isUserTyping) {
      const selectedOption = normalizedOptions.find(
        (opt) => opt.value === value
      );
      setSearchTerm(selectedOption ? selectedOption.label : "");
    }
  }, [value, normalizedOptions]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setIsUserTyping(true);
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs relative">
      {label && <label className="text-gray-700 font-bold">{label}</label>}
      <input
        type="text"
        placeholder={`Search ${label}`}
        value={searchTerm}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-green-100 cursor-pointer"
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setIsUserTyping(false);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
