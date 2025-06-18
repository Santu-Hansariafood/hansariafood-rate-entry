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
  } = useSaudaEntries(company);

  const [showCommodityPicker, setShowCommodityPicker] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showRatePicker, setShowRatePicker] = useState(false);

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
        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
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
                  const newRate = rateMap[keyNorm] || 0;
                  if (newRate === 0) return null;

                  const key = `${unit}-${commodity}`;
                  const list = entries[key] || [];
                  sl += 1;

                  return (
                    <tr key={key} className="transition-all hover:bg-gray-50">
                      <td className="px-3 py-2">{sl}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {unit}
                      </td>
                      <td className="px-3 py-2">{commodity}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700">
                        ₹ {newRate}
                      </td>

                      <td className="space-y-1 px-3 py-2">
                        {list.map((e, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500">
                              {String.fromCharCode(97 + idx)}.
                            </span>
                            <input
                              className="w-16 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                              placeholder="Tons"
                              type="number"
                              value={e.tons}
                              onChange={(ev) =>
                                handleChange(key, idx, "tons", ev.target.value)
                              }
                            />
                            <span className="text-sm text-gray-500">Tons</span>
                            <input
                              className="min-w-[100px] rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                              placeholder="Desc"
                              style={{
                                width: `${Math.max(
                                  (e.description || "").length * 8 + 20,
                                  100
                                )}px`,
                              }}
                              type="text"
                              value={e.description}
                              onChange={(ev) =>
                                handleChange(
                                  key,
                                  idx,
                                  "description",
                                  ev.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => addRow(key)}
                        >
                          + Add Sauda
                        </button>
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-2">
                          {list.map((e, idx) => (
                            <input
                              key={idx}
                              className="w-20 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                              placeholder="No"
                              type="number"
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
                          ))}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-2 font-bold text-green-700">
                        {totalTons(key)} Tons
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
