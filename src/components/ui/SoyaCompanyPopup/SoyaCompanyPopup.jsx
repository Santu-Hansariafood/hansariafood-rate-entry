"use client";

import { motion } from "framer-motion";

export default function SoyaCompanyPopup({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-[400px] rounded-2xl p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-green-700">
            {data.plantName}
          </h2>

          <button
            onClick={onClose}
            className="text-red-500 font-bold text-xl"
          >
            ×
          </button>
        </div>

        {/* Locations */}
        <div className="mb-4">
          <h3 className="font-semibold text-green-600 mb-1">📍 Locations</h3>
          {data.locations?.length ? (
            <ul className="ml-5 list-disc text-gray-700">
              {data.locations.map((loc, i) => (
                <li key={i}>{loc.location}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No locations added.</p>
          )}
        </div>

        {/* Commodities */}
        <div>
          <h3 className="font-semibold text-green-600 mb-1">
            🌾 Available Commodities
          </h3>

          {data.commodities?.length ? (
            <ul className="ml-5 list-disc text-gray-700">
              {data.commodities.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No commodities listed.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
