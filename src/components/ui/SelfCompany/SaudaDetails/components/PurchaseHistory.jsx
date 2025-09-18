import React, { useState } from "react";
import SaudaItem from "./SaudaItem";

const PurchaseHistory = ({ units, onSaveTag }) => {
  // Track input values per consignee
  const [tags, setTags] = useState({});

  const handleInputChange = (unit, value) => {
    setTags((prev) => ({ ...prev, [unit]: value }));
  };

  const handleSave = (unit) => {
    if (onSaveTag) {
      onSaveTag(unit, tags[unit] || "");
    }
  };

  if (!units.length) {
    return (
      <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 shadow-md">
        <div className="text-base font-semibold text-green-700 dark:text-green-300 mb-3">
          Purchase History
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No purchases recorded for this date.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 shadow-md">
      <div className="text-base font-semibold text-green-700 dark:text-green-300 mb-3">
        Purchase History
      </div>
      <div className="space-y-4">
        {units.map((u, idx) => (
          <div
            key={`buy-${idx}`}
            className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 shadow-sm"
          >
            {/* Consignee row with input + save button */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Consignee:{" "}
                <span className="text-green-700 dark:text-green-300">
                  {u.unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tag sauda..."
                  value={tags[u.unit] || ""}
                  onChange={(e) => handleInputChange(u.unit, e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-400 outline-none"
                />
                <button
                  onClick={() => handleSave(u.unit)}
                  className="text-sm px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Commodities + saudas */}
            <div className="space-y-3">
              {u.commodities.map((co, cidx) => (
                <div key={`buy-${idx}-${cidx}`}>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="inline-block bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {co.commodity}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({co.totalTons} Tons)
                    </span>
                  </div>
                  <div className="mt-2 border-t border-gray-400 dark:border-gray-600 pt-2 space-y-2">
                    {co.saudas.map((s, sidx) => (
                      <SaudaItem
                        key={`buy-${idx}-${cidx}-${sidx}`}
                        sauda={s}
                        colorClass="text-green-700 dark:text-green-300"
                        prefix="= ₹"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistory;
