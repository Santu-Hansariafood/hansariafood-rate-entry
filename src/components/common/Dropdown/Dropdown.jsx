"use client";

import React from "react";

const Dropdown = ({ label, options = [], value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-gray-700 font-medium">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
