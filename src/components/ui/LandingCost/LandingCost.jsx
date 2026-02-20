"use client";

import { Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Info,
  X,
  IndianRupee,
  Clock,
  History,
  Download,
} from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { toast } from "react-toastify";
import useLandingCost from "@/hooks/LandingCost/useLandingCost";
import { exportLandingCostToExcel } from "@/utils/landingCostExcel";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));

export default function LandingCost() {
  const {
    companies,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    selectedCompany,
    setSelectedCompany,
    selectedCommodity,
    setSelectedCommodity,
    selectedLocation,
    setSelectedLocation,
    rates,
    ratesLoading,
    history,
    historyLoading,
    categoryOptions,
    companyOptions,
    commodityOptions,
    locationOptions,
    isSelectionComplete,
    tableRows,
  } = useLandingCost();

  const handleDownloadExcel = useCallback(() => {
    if (!selectedCommodity || tableRows.length === 0) {
      toast.warn("No landing cost data available to export");
      return;
    }
    exportLandingCostToExcel(tableRows, selectedCommodity, selectedLocation);
  }, [selectedCommodity, selectedLocation, tableRows]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-2"
        >
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100/70 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/80 dark:from-emerald-950/60 dark:via-slate-950/80 dark:to-sky-950/60 shadow-lg">
            <div className="absolute -right-20 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 px-6 py-6 md:px-10 md:py-8 md:flex-row md:items-center">
              <div className="flex items-center justify-center md:justify-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <Title text="Landing Cost" />
                <p className="mt-2 max-w-xl text-sm md:text-base text-gray-500 dark:text-gray-400 mx-auto md:mx-0">
                  Select category, buyer company, commodity, and location to see live landed cost with freight included.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-[11px] text-gray-600 dark:text-gray-300">
                {selectedCommodity && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1 shadow-sm border border-emerald-100/80 dark:border-slate-700">
                    <IndianRupee className="w-3 h-3 text-emerald-500" />
                    {selectedCommodity}
                  </span>
                )}
                {selectedCompany && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1 shadow-sm border border-emerald-100/80 dark:border-slate-700">
                    <History className="w-3 h-3 text-sky-500" />
                    {selectedCompany}
                  </span>
                )}
                {selectedLocation && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1 shadow-sm border border-emerald-100/80 dark:border-slate-700">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {selectedLocation}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 items-center rounded-full bg-emerald-50 text-emerald-700 px-3 text-xs font-semibold tracking-wide dark:bg-emerald-900/30">
                  Step 1
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure your market selection
                </p>
              </div>
              {isSelectionComplete && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Ready • Showing landed cost and history
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Dropdown
                label="1. Select Category"
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
              <Dropdown
                label="2. Buyer company"
                placeholder="Choose Buyer company..."
                options={companyOptions}
                value={selectedCompany}
                onChange={setSelectedCompany}
                disabled={loading}
              />
              <Dropdown
                label="3. Select Commodity"
                placeholder="Choose Commodity..."
                options={commodityOptions}
                value={selectedCommodity}
                onChange={setSelectedCommodity}
                disabled={!selectedCompany}
              />
              <Dropdown
                label="4. Select Location"
                placeholder="Choose Location..."
                options={locationOptions}
                value={selectedLocation}
                onChange={setSelectedLocation}
                disabled={!selectedCommodity}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-3xl"
              >
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <X size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Error Loading Data</h3>
                <p className="text-red-600 dark:text-red-500/70 mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
              </motion.div>
            ) : ratesLoading ? (
              <div className="mt-12 flex justify-center">
                <Loading />
              </div>
            ) : selectedCommodity && rates.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Latest {selectedCommodity} Market Rates
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {rates.length} Rates Found
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadExcel}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Excel
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                  <div className="max-h-[70vh] overflow-y-auto">
                    <Table
                      data={tableRows}
                      columns={[
                        { header: "Sl No", accessor: "slno" },
                        { header: "Company", accessor: "companyName" },
                        { header: "Commodity", accessor: "commodity" },
                        { header: "Location", accessor: "location" },
                        {
                          header: "Destination",
                          cell: (row) => row.destination || "—",
                        },
                        {
                          header: "Base Rate (₹)",
                          cell: (row) => `₹${row.baseRate}`,
                        },
                        {
                          header: "Freight (₹)",
                          cell: (row) => `₹${row.freight}`,
                        },
                        {
                          header: "Landed (₹)",
                          cell: (row) => `₹${row.landed}`,
                        },
                        {
                          header: "Date",
                          cell: (row) =>
                            new Date(row.date).toLocaleDateString("en-IN"),
                        },
                      ]}
                    />
                  </div>
                </div>
              </motion.div>
            ) : selectedCommodity && !ratesLoading ? (
              <motion.div
                key="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl"
              >
                <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Info size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Rate Updated</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">There is no rate available for {selectedCommodity}.</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl"
              >
                <p className="text-gray-400 font-medium">Please complete the selection above to continue.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isSelectionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 md:p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedCommodity} rate history
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedCompany} • {selectedLocation}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={14} />
                <span>Latest updates first</span>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-6">
                <Loading />
              </div>
            ) : history.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No historical rates found for this selection.
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {history.map((entry, idx) => {
                  const baseRate = Number(entry.finalRate ?? entry.oldRate ?? 0) || 0;
                  const freight = Number(entry.freightRate || 0);
                  const landed = baseRate + freight;

                  return (
                    <div
                      key={`${entry.date}-${idx}`}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700">
                          <IndianRupee size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{landed.toLocaleString("en-IN")}
                            {freight ? (
                              <span className="ml-2 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                (₹{baseRate.toLocaleString("en-IN")} + ₹{freight.toLocaleString("en-IN")} freight)
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            Previous: {entry.oldRate ? `₹${Number(entry.oldRate).toLocaleString("en-IN")}` : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {new Date(entry.date).toLocaleDateString("en-IN")}
                        </div>
                        {entry.destinationLocation ? (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            Destination: {entry.destinationLocation}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                <TrendingUp size={24} />
             </div>
             <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Hansaria Food Private Limited</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reliable procurement through data-driven insights.</p>
             </div>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Live Market Data</span>
             </div>
          </div>
        </motion.div>
      </div>
    </Suspense>
  );
}
