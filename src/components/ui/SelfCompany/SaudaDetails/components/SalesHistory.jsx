import React, { useState } from "react";
import SalesSaudaItem from "./SalesSaudaItem";

const SalesHistory = ({ units, filterUnitsBySeller, onSaveTag }) => {
  // Track input values per seller
  const [tags, setTags] = useState({});

  const handleInputChange = (unit, value) => {
    setTags((prev) => ({ ...prev, [unit]: value }));
  };

  const handleSave = (unit) => {
    if (onSaveTag) {
      onSaveTag(unit, tags[unit] || "");
    }
  };

  // Filter units to only include those with seller information
  const filteredUnits = filterUnitsBySeller ? filterUnitsBySeller(units) : 
    units.filter(unit => {
      // Check if any sauda in any commodity has seller information
      return unit.commodities?.some(commodity => 
        commodity.saudas?.some(sauda => sauda.sellerName || sauda.sellerCompany)
      );
    });

  if (!filteredUnits.length) {
    return (
      <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 shadow-md">
        <div className="text-base font-semibold text-yellow-700 dark:text-yellow-300 mb-3">
          Sales History
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No sales for any sellers on this date.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 shadow-md">
      <div className="text-base font-semibold text-yellow-700 dark:text-yellow-300 mb-3">
        Sales History
      </div>
      <div className="space-y-4">
        {filteredUnits.map((u, idx) => (
          <div
            key={`sell-${idx}`}
            className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 shadow-sm"
          >
            {/* Seller row with input + save button */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Seller:{" "}
                <span className="text-yellow-700 dark:text-yellow-300">
                  {u.unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tag sauda..."
                  value={tags[u.unit] || ""}
                  onChange={(e) => handleInputChange(u.unit, e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <button
                  onClick={() => handleSave(u.unit)}
                  className="text-sm px-3 py-1 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 transition"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Commodities + saudas */}
            <div className="space-y-3">
              {u.commodities.map((co, cidx) => {
                // Filter saudas to only include those with seller information
                const sellerSaudas = co.saudas.filter(s => s.sellerName || s.sellerCompany);
                
                if (sellerSaudas.length === 0) return null;
                
                return (
                  <div key={`sell-${idx}-${cidx}`}>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="inline-block bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {co.commodity}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({co.totalTons} Tons)
                      </span>
                    </div>
                    <div className="mt-2 border-t border-gray-400 dark:border-gray-600 pt-2 space-y-2">
                      {sellerSaudas.map((s, sidx) => (
                        <SalesSaudaItem
                          key={`sell-${idx}-${cidx}-${sidx}`}
                          sauda={s}
                          colorClass="text-yellow-700 dark:text-yellow-300"
                          prefix="= ₹"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesHistory;
