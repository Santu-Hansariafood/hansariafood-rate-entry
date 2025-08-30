"use client";

import { X } from "lucide-react";

const RateUpdateHeader = ({ onClose }) => {
  return (
    <div
      className="sticky top-0 flex justify-between items-center px-6 py-4 
                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                    shadow z-10"
    >
      <h2 id="rate-update-title" className="text-lg sm:text-xl font-bold">
        No Buying Advisory — Selected Companies
      </h2>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-white/20 transition"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default RateUpdateHeader;
