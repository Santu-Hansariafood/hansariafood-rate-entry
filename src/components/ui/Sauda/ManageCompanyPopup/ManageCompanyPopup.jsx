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
import { useSaudaExport } from "@/hooks/ManageCompanyPopup/useSaudaExport";
import { useFirstLoadBlocker } from "@/hooks/ManageCompanyPopup/useFirstLoadBlocker";
import { useSellers } from "@/hooks/ManageCompanyPopup/useSellers";
import { useUser } from "@/context/UserContext";

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

export default function ManageCompanyPopup({ name, onClose, onSaudaAdded }) {
  const { mobile } = useUser();
  const today = useToday();
  const { company, loading: loadingCompany, role } = useCompanyData(name);
  const { rates, rateMap, loading: loadingRates } = useRateData(company?.name);
  const {
    entries,
    handleChange,
    addRow,
    removeRow,
    totalTons,
    loading: loadingSauda,
  } = useSaudaEntries(company, rateMap);
  const { sellers, loading: loadingSellers } = useSellers();

  const [lastUpdated, setLastUpdated] = useState(null);
  const [tradeMode, setTradeMode] = useState("");

  const { handleUnitSave, saveStatus } = useSaudaSave(
    company,
    entries,
    role,
    tradeMode,
    today,
    lastUpdated,
    setLastUpdated,
    mobile
  );
  const exportHook = useSaudaExport({ company, today, rates, entries });

  const firstLoading = useFirstLoadBlocker([!loadingCompany, company]);

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
  }, [role, tradeMode]);

  if (firstLoading || !company) return <Loading />;

  const loading = loadingRates || loadingSauda || loadingSellers;

  const handleUnitSaveWithRefresh = async (...args) => {
    const result = await handleUnitSave(...args);

    if (result !== false) {
      onSaudaAdded?.();
    }

    return result;
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
          <button
            aria-label="Close"
            onClick={() => onClose("red")}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-500 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Title text={company.name} />
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                📅 Date:{" "}
                <span className="text-red-600 dark:text-red-400">{today}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            ) : (
              <SaudaTable
                company={company}
                rateMap={rateMap}
                entries={entries}
                totalTons={totalTons}
                handleChange={handleChange}
                handleUnitSave={handleUnitSaveWithRefresh}
                addRow={addRow}
                removeRow={removeRow}
                saveStatus={saveStatus}
                sellers={sellers}
                date={today}
                mobile={mobile}
              />
            )}
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
