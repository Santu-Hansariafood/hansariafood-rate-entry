"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));

export default function SoyaCompanyPopup({ isOpen, onClose, data }) {
  const [expandedLocations, setExpandedLocations] = useState([]);
  const [rates, setRates] = useState({});
  const [editing, setEditing] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // ------------------ Load existing rate history ------------------
  useEffect(() => {
    if (!isOpen || !data?._id) return;
    loadExistingHistory();
  }, [isOpen, data]);

  const loadExistingHistory = async () => {
    try {
      setLoadingFetch(true);

      const res = await axiosInstance.get(`/ratehistory/${data._id}`);
      const saved = res.data; // array of RateHistory docs

      const initial = {};
      data.location.forEach((loc) => {
        initial[loc] = data.commodities.map((c) => {
          const match = saved.find(
            (r) => r.location === loc && r.commodity === c
          );
          return {
            commodity: c,
            oldRate: match?.oldRate || 0,
            newRate: match?.newRate || "",
            others: match?.others || "",
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

  // ------------------ Toggle ------------------
  const toggleLocation = (loc) => {
    setExpandedLocations((prev) =>
      prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]
    );
  };

  const toggleEdit = (loc, index) => {
    setEditing((prev) => ({
      ...prev,
      [`${loc}_${index}`]: !prev[`${loc}_${index}`],
    }));
  };

  const handleInputChange = (loc, index, field, value) => {
    setRates((prev) => {
      const copy = { ...prev };
      copy[loc][index][field] = value;
      return copy;
    });
  };

  // ------------------ Save individual rate ------------------
  const handleSaveCommodity = async (loc, index) => {
    try {
      setLoadingSave(true);

      const payload = {
        locationName: loc,
        commodityName: rates[loc][index].commodity,
        oldRate: rates[loc][index].oldRate,
        newRate: rates[loc][index].newRate,
        others: rates[loc][index].others,
      };

      await axiosInstance.post(`/ratehistory/${data._id}`, payload);
      toggleEdit(loc, index);
    } catch (error) {
      console.error("Saving error:", error);
    } finally {
      setLoadingSave(false);
    }
  };

  // ------------------ Render arrow ------------------
  const renderArrow = (oldRate, newRate) => {
    const oldNum = parseFloat(oldRate) || 0;
    const newNum = parseFloat(newRate) || 0;
    if (!newRate) return null;
    if (newNum > oldNum) return <span className="text-green-600 font-semibold">↑</span>;
    if (newNum < oldNum) return <span className="text-red-600 font-semibold">↓</span>;
    return <span className="text-gray-400">–</span>;
  };

  if (!isOpen || !data) return null;
  const isScrollable = data.location.length > 8;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-800">{data.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Locations & Commodity Rates</p>

          {loadingFetch ? (
            <p className="text-gray-600 text-sm italic">Loading...</p>
          ) : (
            <div className={`space-y-3 ${isScrollable ? "max-h-[400px] overflow-y-auto pr-2 custom-scroll" : ""}`}>
              {data.location.length ? (
                data.location.map((loc) => (
                  <div key={loc} className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleLocation(loc)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
                    >
                      <span className="font-medium text-gray-800">{loc}</span>
                      {expandedLocations.includes(loc) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {expandedLocations.includes(loc) && (
                      <div className="p-4 space-y-3 bg-white">
                        {rates[loc]?.map((item, index) => {
                          const isEditing = editing[`${loc}_${index}`];
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
                            >
                              <div className="flex items-center mb-3">
                                <span className="font-medium text-gray-800 text-sm">{item.commodity}</span>
                                <span className="ml-2">{renderArrow(item.oldRate, item.newRate)}</span>

                                <div className="ml-auto">
                                  {!isEditing ? (
                                    <button
                                      onClick={() => toggleEdit(loc, index)}
                                      className="px-3 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-100"
                                    >
                                      Edit
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleSaveCommodity(loc, index)}
                                      className="px-3 py-1 text-xs rounded-md bg-green-600 text-white"
                                    >
                                      {loadingSave ? "Saving..." : "Save"}
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <InputBox label="Old Rate" value={item.oldRate} readOnly />
                                <InputBox
                                  label="New Rate"
                                  value={item.newRate}
                                  readOnly={!isEditing}
                                  onChange={(e) => handleInputChange(loc, index, "newRate", e.target.value)}
                                />
                                <InputBox
                                  label="Others"
                                  value={item.others}
                                  readOnly={!isEditing}
                                  onChange={(e) => handleInputChange(loc, index, "others", e.target.value)}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No locations added.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
