"use client";

import React from "react";

const InputBox = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  readOnly = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-gray-700 font-medium">{label}</label>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className={`border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${
          readOnly
            ? "bg-gray-100 text-gray-600 cursor-not-allowed"
            : "focus:ring-green-500"
        }`}
      />
    </div>
  );
};

export default InputBox;
