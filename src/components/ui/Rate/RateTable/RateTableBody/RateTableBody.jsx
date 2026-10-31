"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { toTitleCase } from "@/utils/formatName/formatName";

const RateTableRow = dynamic(() =>
  import("@/components/ui/Rate/RateTable/RateTableRow/RateTableRow")
);

export default function RateTableBody({
  rates,
  allRatesFilled,
  editIndex,
  handleEdit,
  handleSave,
  setRates,
  actualStartIndex,
  commodity,
}) {
  const [expandedStates, setExpandedStates] = useState({});

  const groupedRates = useMemo(() => {
    const indexedRates = rates.map((rate, i) => ({
      ...rate,
      actualIndex: actualStartIndex + i,
    }));

    return indexedRates.reduce((acc, rate) => {
      const state = rate.state || "Unknown";
      if (!acc[state]) acc[state] = [];
      acc[state].push(rate);
      return acc;
    }, {});
  }, [rates, actualStartIndex]);

  const toggleState = (stateName) => {
    setExpandedStates((prev) => ({
      ...prev,
      [stateName]: !prev[stateName],
    }));
  };

  return (
    <div
      className={`transition-all duration-300 ${
        allRatesFilled ? "bg-green-50 dark:bg-green-950/40" : "bg-red-50 dark:bg-red-950/40"
      }`}
    >
      {Object.entries(groupedRates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([state, stateRates]) => (
          <div key={state} className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleState(state)}
              className={`w-full text-left px-4 sm:px-6 py-4 font-semibold text-lg transition ${
                expandedStates[state]
                  ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                  : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {toTitleCase(state)}
            </button>
            <AnimatePresence>
              {expandedStates[state] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Location
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            State
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Commodity
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Last Rate
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Quantity
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            New Rate
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Payment
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Others
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {stateRates.map((rate) => (
                            <RateTableRow
                              key={`${rate.location}-${rate.actualIndex}`}
                              rate={rate}
                              index={rate.actualIndex}
                              editIndex={editIndex}
                              handleEdit={handleEdit}
                              handleSave={handleSave}
                              setRates={setRates}
                              commodity={rate.commodity}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
    </div>
  );
}
