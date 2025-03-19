"use client";

import React, { useState } from "react";

const Dropdown = ({ label, options = [], value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter((option) =>
    (option.label || option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs relative">
      {label && <label className="text-gray-700 font-bold">{label}</label>}
      <input
        type="text"
        placeholder={`Search ${label}`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  onChange(option.value || option);
                  setSearchTerm(option.label || option);
                  setIsOpen(false);
                }}
              >
                {option.label || option}
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
