"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));

export default function SoyaCompanyPopup({ isOpen, onClose, data }) {
  const [expandedLocations, setExpandedLocations] = useState([]);
  const [rates, setRates] = useState({});
  const [editing, setEditing] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

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
        initial[loc] = data.commodities.map((commodity) => {
          const entry = history.find(
            (r) => r.location === loc && r.commodity === commodity
          );

          return {
            commodity,
            oldRate: entry?.oldRate || 0,
            newRate: entry?.newRate || "",
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

  const handleSaveCommodity = async (loc, index) => {
    try {
      const item = rates[loc][index];
      if (!item.newRate) return;

      setLoadingSave(true);

      await axiosInstance.post(`/ratehistory/${data._id}`, {
        locationName: loc,
        commodityName: item.commodity,
        newRate: item.newRate,
        others: item.others,
      });

      toggleEdit(loc, index);
      loadExistingHistory();
    } catch (error) {
      console.error("Saving error:", error);
    } finally {
      setLoadingSave(false);
    }
  };

  const renderRateDifference = (oldRate, newRate) => {
    if (!newRate || !oldRate) return null;

    const diff = Number(newRate) - Number(oldRate);

    if (diff === 0) {
      return <span className="ml-2 text-gray-500 text-sm font-medium">0</span>;
    }

    return (
      <span
        className={`ml-2 text-sm font-semibold ${
          diff > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {diff > 0 ? `+${diff}` : diff}
      </span>
    );
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center px-5 py-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-800">{data.name}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-hidden">
          {loadingFetch ? (
            <Loading />
          ) : (
            <div className="h-full overflow-y-auto pr-2 space-y-3 custom-scroll">
              {data.location.map((loc) => (
                <div key={loc} className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleLocation(loc)}
                    className="w-full px-4 py-3 flex justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-medium text-gray-800">{loc}</span>
                    {expandedLocations.includes(loc) ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
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
                            className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                          >
                            <div className="flex items-center mb-3">
                              <span className="font-medium text-sm text-gray-800">
                                {item.commodity}
                              </span>

                              {renderRateDifference(item.oldRate, item.newRate)}

                              <div className="ml-auto">
                                {!isEditing ? (
                                  <button
                                    onClick={() => toggleEdit(loc, index)}
                                    className="px-3 py-1 text-xs border rounded bg-white hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleSaveCommodity(loc, index)
                                    }
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                                  >
                                    {loadingSave ? "Saving..." : "Save"}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <InputBox
                                label="Old Rate"
                                value={item.oldRate}
                                readOnly
                              />
                              <InputBox
                                label="New Rate"
                                type="number"
                                value={item.newRate}
                                readOnly={!isEditing}
                                onChange={(e) =>
                                  handleInputChange(
                                    loc,
                                    index,
                                    "newRate",
                                    e.target.value
                                  )
                                }
                              />
                              <InputBox
                                label="Others"
                                value={item.others}
                                readOnly={!isEditing}
                                onChange={(e) =>
                                  handleInputChange(
                                    loc,
                                    index,
                                    "others",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
