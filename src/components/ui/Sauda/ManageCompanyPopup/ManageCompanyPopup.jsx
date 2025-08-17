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
const SaudaTable = dynamic(
  () => import("@/components/ui/Sauda/SaudaTable/SaudaTable"),
  { suspense: true }
);
const TradeModeSelector = dynamic(
  () => import("@/components/ui/Sauda/TradeModeSelector/TradeModeSelector"),
  { suspense: true }
);

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
  const [saveStatus, setSaveStatus] = useState({});

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

    const entryId = `${key}-${idx}`;
    setSaveStatus((prev) => ({ ...prev, [entryId]: "saving" }));

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
      setSaveStatus((prev) => ({ ...prev, [entryId]: "error" }));
      return;
    }

    payload[effectiveRole] = company.name;

    try {
      const { status, data } = await axiosInstance.post("/save-sauda", payload);
      if (status === 201 && data.entry) {
        toast.success(`Saved successfully for ${unit} - ${commodity}`);
        setLastUpdated(data.entry.lastUpdated);
        setSaveStatus((prev) => ({ ...prev, [entryId]: "success" }));
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("Data has been updated by someone else. Please refresh.");
      } else {
        toast.error("Error saving data");
      }
      setSaveStatus((prev) => ({ ...prev, [entryId]: "error" }));
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
            <SaudaTable
              company={company}
              rateMap={rateMap}
              entries={entries}
              totalTons={totalTons}
              handleChange={handleChange}
              handleUnitSave={handleUnitSave}
              addRow={addRow}
              descKey={descKey}
              descSuggestions={descSuggestions}
              fetchDescriptionSuggestions={fetchDescriptionSuggestions}
              setDescSuggestions={setDescSuggestions}
              saveStatus={saveStatus}
            />
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
          <ActionButtons
            onShare={handleShare}
            onExportRate={handleExportRate}
          />
        </div>
      </div>
      {company?.type?.length === 2 && !tradeMode && (
        <TradeModeSelector onSelect={setTradeMode} />
      )}
    </Suspense>
  );
}
