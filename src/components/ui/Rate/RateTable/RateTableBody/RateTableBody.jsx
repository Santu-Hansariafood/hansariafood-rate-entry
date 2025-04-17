"use client";

import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const RateTableRow = dynamic(() => import("../RateTableRow/RateTableRow"));

export default function RateTableBody({
  rates,
  allRatesFilled,
  editIndex,
  handleEdit,
  handleSave,
  setRates,
  actualStartIndex,
}) {
  const [expandedStates, setExpandedStates] = useState({});

  const indexedRates = rates.map((rate, i) => ({
    ...rate,
    actualIndex: actualStartIndex + i,
  }));

  const groupedRates = indexedRates.reduce((acc, rate) => {
    if (!acc[rate.state]) acc[rate.state] = [];
    acc[rate.state].push(rate);
    return acc;
  }, {});

  const toggleState = (stateName) => {
    setExpandedStates((prev) => ({
      ...prev,
      [stateName]: !prev[stateName],
    }));
  };

  return (
    <Suspense fallback={<Loading />}>
      <div
        className={`max-h-[70vh] overflow-auto transition-all duration-300 ${
          allRatesFilled ? "bg-green-50" : "bg-red-50"
        }`}
      >
        {Object.entries(groupedRates).map(([state, stateRates]) => (
          <div key={state} className="border-b">
            <button
              onClick={() => toggleState(state)}
              className={`w-full text-left px-6 py-4 font-semibold text-lg transition ${
                expandedStates[state]
                  ? "bg-green-100 text-green-800"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              {state}
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
                    <table className="w-full border-collapse bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                            Location
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                            State
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                            Last Rate
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">
                            New Rate
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 border-b">
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
    </Suspense>
  );
}
