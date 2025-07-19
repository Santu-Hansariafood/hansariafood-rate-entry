"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { X, Save, Share2, ArrowDownToLine } from "lucide-react";
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
              <tr className="bg-green-500 text-left font-semibold text-gray-100">
                <th className="px-3 py-2">Sl.</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Commodity</th>
                <th className="px-3 py-2">Target Quantity</th>
                <th className="px-3 py-2">Rate</th>
                <th className="px-3 py-2">Sauda (Tons + Desc)</th>
                <th className="px-3 py-2">Sauda No</th>
                <th className="px-3 py-2">Total Tons</th>
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
                        {list.map((e, idx) => (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center gap-2 border-b border-dashed border-gray-200 pb-1"
                          >
                            <span className="font-semibold text-gray-500">
                              {String.fromCharCode(97 + idx)}.
                            </span>
                            <span className="text-sm text-gray-500">₹</span>

                            <input
                              className="w-20 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                              placeholder="Final Rate"
                              type="number"
                              min={0}
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

                            <input
                              className="w-16 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                              placeholder="Tons"
                              type="number"
                              min={0}
                              value={e.tons}
                              onChange={(ev) =>
                                handleChange(key, idx, "tons", ev.target.value)
                              }
                            />
                            <span className="text-sm text-gray-600">Tons</span>

                            <div className="relative w-full max-w-[300px]">
                              <input
                                type="text"
                                placeholder="Desc"
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={e.description}
                                style={{ resize: "vertical" }}
                                onChange={(ev) => {
                                  const val = ev.target.value;
                                  handleChange(key, idx, "description", val);
                                  fetchDescriptionSuggestions(val, key, idx);
                                }}
                                onFocus={() => {
                                  if (e.description.length >= 2) {
                                    fetchDescriptionSuggestions(
                                      e.description,
                                      key,
                                      idx
                                    );
                                  }
                                }}
                                onBlur={() => {
                                  setTimeout(() => setDescSuggestions([]), 200);
                                }}
                              />

                              {descSuggestions.length > 0 &&
                                descKey === `${key}-${idx}` && (
                                  <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto border border-gray-300 bg-white rounded shadow-lg">
                                    {descSuggestions.map((s, i) => (
                                      <li
                                        key={i}
                                        className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                                        onClick={() => {
                                          handleChange(
                                            key,
                                            idx,
                                            "description",
                                            s
                                          );
                                          setDescSuggestions([]);

                                          const quantity = Number(
                                            entries[key]?.[idx]?.tons || 0
                                          );

                                          axiosInstance
                                            .post(
                                              "/save-sauda/description-stats",
                                              {
                                                description: s,
                                                quantity,
                                              }
                                            )
                                            .catch((err) => {
                                              console.error(
                                                "Failed to update description stats:",
                                                err
                                              );
                                            });
                                        }}
                                      >
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </div>

                            <input
                              className="w-20 rounded border text-xl border-orange-300 px-2 py-1 text-orange-700 focus:ring-2 focus:ring-orange-500"
                              placeholder="Sauda No"
                              type="number"
                              min={0}
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
                        ))}

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

          <div className="mt-4 flex gap-3">
            <button
              className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" /> Save
            </button>

            <button
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" /> Share Sauda
            </button>

            <button
              className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              onClick={handleExportRate}
            >
              <ArrowDownToLine className="h-4 w-4" /> Export Rate
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
