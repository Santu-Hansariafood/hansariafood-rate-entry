"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ArrowUp, ArrowDown } from "lucide-react";

export default function SoyaCompanyPopup({ isOpen, onClose, data }) {
  const [expandedLocations, setExpandedLocations] = useState([]);
  const [rates, setRates] = useState({});

  useEffect(() => {
    if (data?.location && data?.commodities) {
      const initialRates = data.location.reduce((acc, loc) => {
        acc[loc] = data.commodities.map((c) => ({
          commodity: c,
          oldRate: 0, // replace with real old rate if available
          newRate: "",
          quantity: "",
          payments: "",
          others: "",
        }));
        return acc;
      }, {});
      setRates(initialRates);
    }
  }, [data]);

  const toggleLocation = (loc) => {
    setExpandedLocations((prev) =>
      prev.includes(loc)
        ? prev.filter((l) => l !== loc)
        : [...prev, loc]
    );
  };

  const handleInputChange = (loc, index, field, value) => {
    setRates((prev) => {
      const updated = { ...prev };
      if (!updated[loc]) updated[loc] = [];
      updated[loc][index][field] = value;
      return updated;
    });
  };

  const handleSave = (loc) => {
    console.log(`Save rates for ${loc}:`, rates[loc]);
    // Call API to save rates[loc] only
  };

  const renderArrow = (oldRate, newRate) => {
    const oldNum = parseFloat(oldRate) || 0;
    const newNum = parseFloat(newRate) || 0;
    if (newNum > oldNum) return <ArrowUp className="text-green-600 ml-2" size={20} />;
    if (newNum < oldNum) return <ArrowDown className="text-red-600 ml-2" size={20} />;
    return <span className="ml-2 text-gray-400">–</span>; // no change
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-auto py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-5xl rounded-3xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
          <h2 className="text-2xl font-bold text-green-700 truncate">{data.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h3 className="font-semibold text-green-600 mb-2">📍 Locations & Commodities</h3>
          {data.location?.length ? (
            <div className="space-y-3">
              {data.location.map((loc) => (
                <div key={loc} className="border rounded-lg p-3 shadow-sm">
                  {/* Location Header */}
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleLocation(loc)}
                  >
                    <h4 className="font-medium text-gray-700">{loc}</h4>
                    <span className="text-gray-500">
                      {expandedLocations.includes(loc) ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Commodity Inputs */}
                  {expandedLocations.includes(loc) && rates[loc]?.length ? (
                    <div className="mt-3 space-y-2">
                      {rates[loc].map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50"
                        >
                          <span className="w-32 font-medium text-gray-700">{r.commodity}</span>
                          <input
                            type="text"
                            value={r.oldRate}
                            readOnly
                            className="w-20 border border-gray-300 rounded-md p-1 bg-gray-100 text-gray-600"
                          />
                          <input
                            type="number"
                            placeholder="New Rate"
                            value={r.newRate}
                            onChange={(e) =>
                              handleInputChange(loc, i, "newRate", e.target.value)
                            }
                            className="w-20 border border-gray-300 rounded-md p-1"
                          />
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={r.quantity}
                            onChange={(e) =>
                              handleInputChange(loc, i, "quantity", e.target.value)
                            }
                            className="w-20 border border-gray-300 rounded-md p-1"
                          />
                          <input
                            type="text"
                            placeholder="Payments"
                            value={r.payments}
                            onChange={(e) =>
                              handleInputChange(loc, i, "payments", e.target.value)
                            }
                            className="w-24 border border-gray-300 rounded-md p-1"
                          />
                          <input
                            type="text"
                            placeholder="Others"
                            value={r.others}
                            onChange={(e) =>
                              handleInputChange(loc, i, "others", e.target.value)
                            }
                            className="w-24 border border-gray-300 rounded-md p-1"
                          />
                          {/* Arrow Indicator */}
                          {renderArrow(r.oldRate, r.newRate)}
                        </div>
                      ))}

                      {/* Save Button per location */}
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleSave(loc)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded-xl shadow-md transition"
                        >
                          Save {loc}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No locations added.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
