"use client";

import React, { Suspense, useState, useEffect } from "react";
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

export default function ManageCompanyPopup({ name, onClose }) {
  const today = useToday();

  const { company, loading: loadingCompany } = useCompanyData(name);
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

  const [tradeMode, setTradeMode] = useState("");

  const fetchDescriptionSuggestions = async (q, key, idx) => {
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
  };
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const loading = loadingCompany || loadingRates || loadingSauda;

  const handleSave = async () => {
    if (!company) return;

    const structured = {};
    Object.entries(entries).forEach(([k, list]) => {
      const [unit, commodity] = k.split("-");
      structured[k] = list.map((e) => ({
        ...e,
        tons: +e.tons || 0,
        unit,
        commodity,
      }));
    });
    useEffect(() => {
      if (!loading && company?.type?.length === 1) {
        const type = company.type[0];
        setTradeMode(type === "buyer" ? "buying" : "selling");
      }
    }, [loading, company]);

    try {
      const { status, data } = await axiosInstance.post("/save-sauda", {
        company: company.name,
        date: today,
        time: currentTime,
        saudaEntries: structured,
      });
      if (status === 201 && data.entry) {
        toast.success("Updated successfully");
        const filled = Object.values(entries).some((l) =>
          l.some((e) => e.tons || e.description)
        );
        const allNos = Object.values(entries).every((l) =>
          l.every((e) => e.saudaNo)
        );
        onClose(filled ? (allNos ? "blue" : "yellow") : "green");
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Error saving data");
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div
          className="
                      relative w-full 
                      max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
                      max-h-[90vh] overflow-y-auto 
                      rounded-lg bg-white p-6 shadow-lg
                    "
        >
          <button
            aria-label="Close"
            onClick={() => onClose("red")}
            className="absolute right-3 top-2 rounded-full p-1 text-gray-500 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center justify-between">
            <Title text={company.name} />
            <p className="text-red-600">Date: {today}</p>
          </div>

          <table className="w-full overflow-hidden rounded-lg border text-sm shadow-sm">
            <thead>
              <tr className="bg-green-600 text-white text-left">
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

            <tbody className="divide-y divide-gray-200">
              {company.location.flatMap((unit) =>
                company.commodities.map((commodity) => {
                  const keyNorm = `${normalize(unit)}-${normalize(commodity)}`;
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
                  if (company?.type?.length === 2 && !tradeMode) {
                    return null; // until tradeMode is selected
                  }

                  return (
                    <tr key={key} className="transition-all hover:bg-gray-50">
                      <td className="px-3 py-2">{sl}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {unit}
                      </td>
                      <td className="px-3 py-2">{commodity}</td>
                      <td className="px-3 py-2">
                        {quantityNum != null
                          ? `${quantityNum} - ${enteredTons} = ${remaining}`
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700">
                        ₹ {newRate}
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
        flex flex-col sm:flex-row flex-wrap gap-3 p-4 rounded-xl shadow-md transition-all
        border
        ${
          isFilled ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
        }
      `}
                            >
                              <span className="text-base font-semibold text-gray-600">
                                {String.fromCharCode(97 + idx)}.
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-500">₹</span>
                                <input
                                  type="number"
                                  placeholder="Rate"
                                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
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
                                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
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
                                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                  value={e.description}
                                  onChange={(ev) => {
                                    const val = ev.target.value;
                                    handleChange(key, idx, "description", val);
                                    fetchDescriptionSuggestions(val, key, idx);
                                  }}
                                />
                                {descSuggestions.length > 0 && isCurrent && (
                                  <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto border border-gray-300 bg-white rounded shadow-lg">
                                    {descSuggestions.map((s, i) => (
                                      <li
                                        key={i}
                                        className="cursor-pointer px-4 py-2 text-sm hover:bg-blue-100"
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
                              {e.showOthers ? (
                                <input
                                  type="text"
                                  placeholder="Others"
                                  className="w-full rounded border border-yellow-300 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400"
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
                                  className="text-xs text-blue-600 underline"
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
                                className="w-24 rounded border border-orange-400 px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500"
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
                            </div>
                          );
                        })}

                        <div className="flex items-center gap-4 mt-1">
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => addRow(key, newRate)}
                          >
                            + Add Sauda
                          </button>
                          {quantityNum != null && (
                            <div className="text-xs text-red-600">
                              Balance: {remaining}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-bold text-green-700">
                        {enteredTons} Tons
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

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

          <ActionButtons
            onSave={handleSave}
            onShare={handleShare}
            onExportRate={handleExportRate}
          />
        </div>
      </div>
      {company?.type?.length === 2 && !tradeMode && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white p-6 shadow-lg max-w-sm text-center space-y-4">
            <p className="text-lg font-semibold text-gray-700">
              Select Trade Mode
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setTradeMode("buying")}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Buying
              </button>
              <button
                onClick={() => setTradeMode("selling")}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
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
