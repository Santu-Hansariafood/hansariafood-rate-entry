"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ChevronDown, ChevronUp, MapPin, Truck, IndianRupee } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));

export default function MDOCCompanyPopup({ isOpen, onClose, data, onRateUpdate }) {
  const [expandedLocations, setExpandedLocations] = useState([]);
  const [rates, setRates] = useState({});
  const [editing, setEditing] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  const today = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    if (!isOpen || !data?._id) return;
    loadExistingHistory();
  }, [isOpen, data]);

  const loadExistingHistory = async () => {
    try {
      setLoadingFetch(true);
      const res = await axiosInstance.get(`/ratehistory/${data._id}`);
      const history = res.data || [];

      const initial = {};

      data.location.forEach((loc) => {
        initial[loc] = data.commodities.map((commodity, index) => {
          const entry = history.find(
            (r) => r.location === loc && r.commodity === commodity
          );

          return {
            commodity,
            oldRate: entry?.oldRate || 0,
            tempRate: "",
            tempRates: entry?.tempRates || [],
            finalRate: entry?.newRate || "",
            others: entry?.others || "",
          };
        });
      });

      setRates(initial);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingFetch(false);
    }
  };

  const toggleLocation = (loc) => {
    setExpandedLocations((p) =>
      p.includes(loc) ? p.filter((x) => x !== loc) : [...p, loc]
    );
  };

  const toggleEdit = (loc, index) => {
    setEditing((p) => ({
      ...p,
      [`${loc}_${index}`]: !p[`${loc}_${index}`],
    }));
  };

  const handleChange = (loc, index, value) => {
    setRates((p) => {
      const copy = { ...p };
      copy[loc][index].tempRate = value;
      return copy;
    });
  };

  const handleSave = async (loc, index) => {
    const item = rates[loc][index];

    if (!item.tempRate) {
      toggleEdit(loc, index);
      return;
    }

    setLoadingSave(true);
    try {
      const payload = {
        locationName: loc,
        commodityName: item.commodity,
        tempRate: item.tempRate,
      };

      await axiosInstance.post(`/ratehistory/${data._id}`, payload);

      if (onRateUpdate) {
        onRateUpdate({
          companyName: data.name,
          location: loc,
          date: today,
          rate: item.tempRate,
          commodity: item.commodity,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }

      // Trigger global notification update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rates-updated"));
      }

      toggleEdit(loc, index);
      loadExistingHistory();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[95vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{data.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date: {today}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {loadingFetch ? (
            <Loading />
          ) : (
            data.location.map((loc) => (
              <div key={loc} className="border rounded mb-3">
                <button
                  onClick={() => toggleLocation(loc)}
                  className="w-full px-4 py-3 flex justify-between bg-gray-50"
                >
                  <span>{loc}</span>
                  {expandedLocations.includes(loc) ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </button>

                {expandedLocations.includes(loc) && (
                  <div className="p-4 space-y-4">
                    {rates[loc]?.map((item, index) => {
                      const isEditing = editing[`${loc}_${index}`];
                      const key = `${loc}_${index}`;

                      return (
                        <div key={index} className="bg-gray-50 p-4 rounded">
                          <div className="flex justify-between mb-3">
                            <strong>{item.commodity}</strong>
                            {!isEditing ? (
                              <button
                                onClick={() => toggleEdit(loc, index)}
                                className="text-xs border px-3 py-1"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSave(loc, index)}
                                disabled={loadingSave}
                                className={`text-xs px-3 py-1 text-white rounded transition-colors
                                  ${
                                    loadingSave
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                              >
                                {loadingSave ? "Saving..." : "Save"}
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputBox
                              label="Yesterday Rate"
                              value={item.oldRate}
                              readOnly
                            />

                            <InputBox
                              label="Temp Rate (Today)"
                              type="number"
                              value={item.tempRate}
                              readOnly={!isEditing}
                              onChange={(e) =>
                                handleChange(loc, index, e.target.value)
                              }
                            />

                            <InputBox
                              label="Final Rate (Auto)"
                              value={
                                item.tempRates.length
                                  ? item.tempRates[item.tempRates.length - 1]
                                      .rate
                                  : item.finalRate || 0
                              }
                              readOnly
                            />
                          </div>

                          {item.tempRates.length > 0 && (
                            <div className="mt-3 text-sm">
                              <p className="font-semibold mb-1">Today Rates</p>
                              {item.tempRates.map((tr, i) => {
                                const prev =
                                  i === 0
                                    ? item.oldRate
                                    : item.tempRates[i - 1].rate;
                                const diff = tr.rate - prev;

                                return (
                                  <div
                                    key={i}
                                    className="flex justify-between text-xs"
                                  >
                                    <span>{tr.time}</span>
                                    <span>{tr.rate}</span>
                                    <span
                                      className={
                                        diff > 0
                                          ? "text-green-600"
                                          : diff < 0
                                          ? "text-red-600"
                                          : "text-gray-500"
                                      }
                                    >
                                      {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
