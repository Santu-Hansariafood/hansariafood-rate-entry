"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import { useCompanyData } from "@/hooks/ManageCompanyPopup/useCompanyData";
import { useRateData } from "@/hooks/ManageCompanyPopup/useRateData";
import { useSaudaEntries } from "@/hooks/ManageCompanyPopup/useSaudaEntries";
import { useToday } from "@/hooks/ManageCompanyPopup/useToday";
import { generateSaudaPDF } from "@/utils/generateSaudaPDF/generateSaudaPDF";
import { generateRatePDF } from "@/utils/generateSaudaPDF/generateRatePDF";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  suspense: true,
});
const SaudaSharePopup = dynamic(
  () => import("@/components/ui/Sauda/SaudaSharePopup/SaudaSharePopup"),
  { suspense: true }
);
const CommodityPickerPopup = dynamic(
  () =>
    import("@/components/ui/Sauda/CommodityPickerPopup/CommodityPickerPopup"),
  { suspense: true }
);
const ActionButtons = dynamic(
  () => import("@/components/ui/Sauda/ActionButtons/ActionButtons"),
  { suspense: true }
);

const normalize = (s) => s?.trim().toLowerCase() || "";
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function ManageCompanyPopup({ name, onClose }) {
  const today = useToday();

  const { company, loading: loadingCompany, role } = useCompanyData(name);
  const { rates, rateMap, loading: loadingRates } = useRateData(company?.name);
  const {
    entries,
    handleChange,
    addRow,
    totalTons,
    loading: loadingSauda,
  } = useSaudaEntries(company, rateMap);

  const [showCommodityPicker, setShowCommodityPicker] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showRatePicker, setShowRatePicker] = useState(false);
  const [descSuggestions, setDescSuggestions] = useState([]);
  const [descKey, setDescKey] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tradeMode, setTradeMode] = useState("");

  useEffect(() => {
    let isCancelled = false;
    const fetchSauda = async () => {
      if (!company?.name) return;
      try {
        const res = await axiosInstance.get(
          `/save-sauda?company=${company.name}&date=${today}`
        );
        if (!isCancelled && res?.data?.entry) {
          setLastUpdated(res.data.entry.lastUpdated);
        }
      } catch (error) {
        if (!isCancelled) console.error("Failed to fetch sauda:", error);
      }
    };

    fetchSauda();
    return () => {
      isCancelled = true;
    };
  }, [company?.name, today]);

  useEffect(() => {
    if (!tradeMode && (role === "buyer" || role === "seller")) {
      setTradeMode(role === "buyer" ? "buying" : "selling");
    }
  }, [role]);

  const fetchDescriptionSuggestions = useCallback(
    debounce(async (q, key, idx) => {
      try {
        if (!q || q.length < 2) {
          setDescSuggestions([]);
          return;
        }
        setDescKey(`${key}-${idx}`);
        const res = await axiosInstance.get(
          `save-sauda/sauda-descriptions?q=${q}`
        );
        setDescSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300),
    []
  );

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const loading = loadingCompany || loadingRates || loadingSauda;

  const handleUnitSave = async (key, idx) => {
    if (!company) return;

    const [unit, commodity] = key.split("-");
    const entry = entries[key]?.[idx];
    if (!entry) return;

    const payload = {
      company: company.name,
      date: today,
      time: currentTime,
      saudaEntries: {
        [key]: [
          {
            ...entry,
            tons: +entry.tons || 0,
            unit,
            commodity,
          },
        ],
      },
      lastUpdated,
    };

    const effectiveRole =
      role && role !== "both"
        ? role
        : tradeMode === "selling"
        ? "seller"
        : tradeMode === "buying"
        ? "buyer"
        : null;

    if (!effectiveRole) {
      toast.error("Please select trade mode.");
      return;
    }

    payload[effectiveRole] = company.name;

    try {
      const { status, data } = await axiosInstance.post("/save-sauda", payload);
      if (status === 201 && data.entry) {
        toast.success(`Saved successfully for ${unit} - ${commodity}`);
        setLastUpdated(data.entry.lastUpdated);
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("Data has been updated by someone else. Please refresh.");
      } else {
        toast.error("Error saving data");
      }
    }
  };

  const handleShare = () => {
    if (loading) return toast.warn("Data still loading.");
    setShowCommodityPicker(true);
  };
  const handleCommodityDone = (selected) => {
    generateSaudaPDF({
      company: company.name,
      date: today,
      rateData: rates,
      saudaEntries: entries,
      allowedCommodities: selected,
    });
    setShowCommodityPicker(false);
    setShowSharePopup(true);
  };

  const handleExportRate = () => {
    if (loading) return toast.warn("Data still loading.");
    setShowRatePicker(true);
  };
  const handleRateDone = (selected) => {
    generateRatePDF({
      company: company.name,
      date: today,
      rateData: rates,
      allowedCommodities: selected,
    });
    setShowRatePicker(false);
  };

  if (loading) {
    return <Loading />;
  }
  if (!company) return null;

  let sl = 0;

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
        <div
          className="
        relative w-full 
        max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
        max-h-[90vh] overflow-y-auto 
        rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg
        transition-colors
      "
        >
          <button
            aria-label="Close"
            onClick={() => onClose("red")}
            className="absolute right-3 top-2 rounded-full p-1 
          text-gray-500 dark:text-gray-300 
          hover:text-red-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Title text={company.name} />
            <p className="text-red-600 dark:text-red-400">Date: {today}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 text-sm md:text-base shadow-sm">
              <thead>
                <tr className="bg-green-600 dark:bg-green-700 text-white text-left">
                  <th className="px-4 py-3">Sl.</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3">Target Quantity</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Sauda Details</th>
                  <th className="px-4 py-3">Total Tons</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {company.location.flatMap((unit) =>
                  company.commodities.map((commodity) => {
                    const keyNorm = `${normalize(unit)}-${normalize(
                      commodity
                    )}`;
                    const rateObj = rateMap[keyNorm] || {};
                    const newRate = rateObj.newRate || 0;
                    const quantityNum = Number.isFinite(rateObj.quantity)
                      ? rateObj.quantity
                      : null;
                    const key = `${unit}-${commodity}`;
                    const list = entries[key] || [];
                    const enteredTons = totalTons(key);
                    const remaining =
                      quantityNum != null ? quantityNum - enteredTons : "-";

                    if (newRate === 0) return null;
                    sl += 1;
                    if (company?.type?.length === 2 && !tradeMode) return null;

                    return (
                      <tr
                        key={key}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-3 py-2">{sl}</td>
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                          {unit}
                        </td>
                        <td className="px-3 py-2 dark:text-gray-300">
                          {commodity}
                        </td>
                        <td className="px-3 py-2 dark:text-gray-300">
                          {quantityNum != null
                            ? `${quantityNum} - ${enteredTons} = ${remaining}`
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700 dark:text-blue-400">
                          ₹ {newRate}
                        </td>
                        <td colSpan={2} className="space-y-1 px-3 py-2">
                          {list.map((e, idx) => {
                            const isFilled =
                              e?.tons && e?.finalRate && e?.description;
                            const isCurrent = descKey === `${key}-${idx}`;

                            return (
                              <div
                                key={idx}
                                className={`
                              flex flex-col sm:flex-row flex-wrap gap-3 p-4 rounded-xl shadow-md transition-colors
                              border
                              ${
                                isFilled
                                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                                  : "border-red-300 bg-red-50 dark:bg-red-900/20"
                              }
                            `}
                              >
                                <span className="text-base font-semibold text-gray-600 dark:text-gray-300">
                                  {String.fromCharCode(97 + idx)}.
                                </span>
                                {/* Rate */}
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="Rate"
                                    className="w-20 rounded border border-gray-300 dark:border-gray-700 
                                  bg-white dark:bg-gray-800 
                                  text-gray-800 dark:text-gray-200 
                                  px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                                    value={e.finalRate}
                                    onChange={(ev) =>
                                      handleChange(
                                        key,
                                        idx,
                                        "finalRate",
                                        ev.target.value
                                      )
                                    }
                                  />
                                </div>
                                <input
                                  type="number"
                                  placeholder="Tons"
                                  className="w-20 rounded border border-gray-300 dark:border-gray-700 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                                  value={e.tons}
                                  onChange={(ev) =>
                                    handleChange(
                                      key,
                                      idx,
                                      "tons",
                                      ev.target.value
                                    )
                                  }
                                />
                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    placeholder="Description"
                                    className="w-full rounded border border-gray-300 dark:border-gray-700 
                                  bg-white dark:bg-gray-800 
                                  text-gray-800 dark:text-gray-200 
                                  px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                                    value={e.description}
                                    onChange={(ev) => {
                                      const val = ev.target.value;
                                      handleChange(
                                        key,
                                        idx,
                                        "description",
                                        val
                                      );
                                      fetchDescriptionSuggestions(
                                        val,
                                        key,
                                        idx
                                      );
                                    }}
                                  />
                                  {descSuggestions.length > 0 && isCurrent && (
                                    <ul
                                      className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto 
                                  border border-gray-300 dark:border-gray-700 
                                  bg-white dark:bg-gray-800 
                                  rounded shadow-lg"
                                    >
                                      {descSuggestions.map((s, i) => (
                                        <li
                                          key={i}
                                          className="cursor-pointer px-4 py-2 text-sm 
                                        hover:bg-blue-100 dark:hover:bg-blue-900/40 
                                        text-gray-700 dark:text-gray-200"
                                          onClick={() => {
                                            handleChange(
                                              key,
                                              idx,
                                              "description",
                                              s
                                            );
                                            setDescSuggestions([]);
                                            axiosInstance.post(
                                              "/save-sauda/description-stats",
                                              {
                                                description: s,
                                                quantity: Number(
                                                  entries[key]?.[idx]?.tons || 0
                                                ),
                                              }
                                            );
                                          }}
                                        >
                                          {s}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                {e.showOthers || e.others ? (
                                  <input
                                    type="text"
                                    placeholder="Others"
                                    className="w-full rounded border border-yellow-300 dark:border-yellow-600 
                                  bg-white dark:bg-gray-800 
                                  text-gray-800 dark:text-gray-200 
                                  px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                                    value={e.others || ""}
                                    onChange={(ev) =>
                                      handleChange(
                                        key,
                                        idx,
                                        "others",
                                        ev.target.value
                                      )
                                    }
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    className="text-xs text-blue-600 dark:text-blue-400 underline"
                                    onClick={() =>
                                      handleChange(key, idx, "showOthers", true)
                                    }
                                  >
                                    + notes
                                  </button>
                                )}
                                <input
                                  type="number"
                                  placeholder="Sauda No"
                                  className="w-24 rounded border border-orange-400 dark:border-orange-600 
    bg-white dark:bg-gray-800 
    text-gray-800 dark:text-gray-200 
    px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500"
                                  value={e.saudaNo}
                                  onChange={(ev) =>
                                    handleChange(
                                      key,
                                      idx,
                                      "saudaNo",
                                      ev.target.value
                                    )
                                  }
                                />

                                <button
                                  type="button"
                                  onClick={() => handleUnitSave(key, idx)}
                                  className="ml-2 rounded bg-green-600 dark:bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-4 mt-1">
                            <button
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={() => addRow(key, newRate)}
                            >
                              + Add Sauda
                            </button>
                            {quantityNum != null && (
                              <div className="text-xs text-red-600 dark:text-red-400">
                                Balance: {remaining}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-bold text-green-700 dark:text-green-400">
                          {enteredTons} Tons
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {showSharePopup && (
            <SaudaSharePopup
              company={company.name}
              date={today}
              saudaEntries={entries}
              rateData={rates}
              onClose={() => setShowSharePopup(false)}
            />
          )}
          {showCommodityPicker && (
            <CommodityPickerPopup
              options={company.commodities}
              onCancel={() => setShowCommodityPicker(false)}
              onDone={handleCommodityDone}
            />
          )}
          {showRatePicker && (
            <CommodityPickerPopup
              options={company.commodities}
              onCancel={() => setShowRatePicker(false)}
              onDone={handleRateDone}
            />
          )}

          {/* Action Buttons */}
          <ActionButtons
            // onSave={handleSave}
            onShare={handleShare}
            onExportRate={handleExportRate}
          />
        </div>
      </div>
      {company?.type?.length === 2 && !tradeMode && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 dark:bg-black/70">
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg max-w-sm text-center space-y-4">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Select Trade Mode
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setTradeMode("buying")}
                className="rounded bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Buying
              </button>
              <button
                onClick={() => setTradeMode("selling")}
                className="rounded bg-green-600 dark:bg-green-500 px-4 py-2 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                Selling
              </button>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}
