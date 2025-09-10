"use client";
import React from "react";

const Modal = ({ children, onClose, className = "" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 ${className}`}
      >
        <button
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 shadow hover:bg-white dark:hover:bg-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
