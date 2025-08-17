"use client";

import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import { useCompanyData } from "@/hooks/ManageCompanyPopup/useCompanyData";
import { useRateData } from "@/hooks/ManageCompanyPopup/useRateData";
import { useSaudaEntries } from "@/hooks/ManageCompanyPopup/useSaudaEntries";
import { useToday } from "@/hooks/ManageCompanyPopup/useToday";
import { useSaudaSave } from "@/hooks/ManageCompanyPopup/useSaudaSave";
import { useDescriptionSuggestions } from "@/hooks/ManageCompanyPopup/useDescriptionSuggestions";
import { useSaudaExport } from "@/hooks/ManageCompanyPopup/useSaudaExport";
import { useFirstLoadBlocker } from "@/hooks/ManageCompanyPopup/useFirstLoadBlocker";

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

  const [lastUpdated, setLastUpdated] = useState(null);
  const [tradeMode, setTradeMode] = useState("");

  const { handleUnitSave, saveStatus } = useSaudaSave(
    company,
    entries,
    role,
    tradeMode,
    today,
    lastUpdated,
    setLastUpdated
  );
  const {
    descSuggestions,
    setDescSuggestions,
    descKey,
    fetchDescriptionSuggestions,
  } = useDescriptionSuggestions();
  const exportHook = useSaudaExport({ company, today, rates, entries });

  const firstLoading = useFirstLoadBlocker([
    !loadingCompany && !loadingRates && !loadingSauda,
    company,
    rates,
    entries,
  ]);

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

  if (firstLoading) return <Loading />;

  const loading = loadingCompany || loadingRates || loadingSauda;
  if (!company) return null;

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
        <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg">
          <button
            aria-label="Close"
            onClick={() => onClose("red")}
            className="absolute right-3 top-2 rounded-full p-1 text-gray-500 dark:text-gray-300 hover:text-red-500 transition-colors"
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

          {exportHook.showSharePopup && (
            <SaudaSharePopup
              company={company.name}
              date={today}
              saudaEntries={entries}
              rateData={rates}
              onClose={() => exportHook.setShowSharePopup(false)}
            />
          )}
          {exportHook.showCommodityPicker && (
            <CommodityPickerPopup
              options={company.commodities}
              onCancel={() => exportHook.setShowCommodityPicker(false)}
              onDone={exportHook.handleCommodityDone}
            />
          )}
          {exportHook.showRatePicker && (
            <CommodityPickerPopup
              options={company.commodities}
              onCancel={() => exportHook.setShowRatePicker(false)}
              onDone={exportHook.handleRateDone}
            />
          )}

          <ActionButtons
            onShare={() => exportHook.handleShare(loading)}
            onExportRate={() => exportHook.handleExportRate(loading)}
          />
        </div>
      </div>
      {company?.type?.length === 2 && !tradeMode && (
        <TradeModeSelector onSelect={setTradeMode} />
      )}
    </Suspense>
  );
}
