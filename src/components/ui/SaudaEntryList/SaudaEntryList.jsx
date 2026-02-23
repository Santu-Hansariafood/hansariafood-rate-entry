"use client";

import React, { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Clock4 } from "lucide-react";
import useRateEntries from "@/hooks/RateEntries/useRateEntries";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import { useToday } from "@/hooks/ManageCompanyPopup/useToday";
import DateSelector from "@/components/common/DateSelector/DateSelector";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const DownloadSaudaEntriesPDF = dynamic(() =>
  import("./DownloadSaudaEntriesPDF/DownloadSaudaEntriesPDF")
);

const SaudaEntryList = () => {
  const { groupedRates, mobileToName, loading, date, setDate } = useRateEntries();
  const [expandedMobile, setExpandedMobile] = useState(null);
  const today = useToday();

  const formatSaudaNo = (value) =>
    value ? value.toString().slice(-4) : "";

  const toggleExpand = (mobile) =>
    setExpandedMobile((prev) => (prev === mobile ? null : mobile));

  if (loading) return <Loading />;

  const saudaGroups = Object.entries(groupedRates).filter(
    ([_, data]) => data.saudas && data.saudas.length > 0
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen p-6 bg-gray-100 dark:bg-gray-950 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto rounded-3xl border border-white/20
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                   shadow-2xl p-6 md:p-10"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-4 mb-8">
            <Title text="📊 Today Sauda Entries" />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="w-full sm:w-64">
                <DateSelector
                  value={date ? date.split("-").reverse().join("-") : ""}
                  onChange={(newDate) => {
                    if (newDate) {
                      setDate(newDate.split("-").reverse().join("-"));
                    }
                  }}
                  label="Select Date"
                />
              </div>
              <div className="w-full sm:w-auto self-end sm:self-auto">
                <DownloadSaudaEntriesPDF 
                  saudaGroups={saudaGroups} 
                  mobileToName={mobileToName}
                  date={date || today}
                />
              </div>
            </div>
          </div>

          {saudaGroups.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20">
              No sauda entries found today 📭
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saudaGroups.map(([mobile, data], i) => (
                <motion.div
                  key={mobile}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl border border-white/20
                           bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg
                           shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(mobile)}
                    className="w-full px-5 py-4 flex justify-between items-center
                             bg-gradient-to-r from-yellow-500/10 to-orange-500/10
                             hover:from-yellow-500/20 hover:to-orange-500/20
                             transition text-left"
                  >
                    <div>
                      <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                        {mobileToName[mobile] || mobile}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {data.saudas.length} Saudas
                      </p>
                    </div>

                    <motion.span
                      animate={{ rotate: expandedMobile === mobile ? 180 : 0 }}
                      className="text-gray-500"
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {expandedMobile === mobile && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 py-4 space-y-6 border-t border-white/20"
                      >
                        <div className="space-y-3">
                          {data.saudas.map((sauda, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl p-3 bg-yellow-50/90 dark:bg-yellow-900/20
                                       border border-yellow-200/60 dark:border-yellow-700/50
                                       shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                  <Building2 size={14} className="inline mr-1" />
                                  {sauda.company}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Sauda #{formatSaudaNo(sauda.saudaNo)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mt-2">
                                <div>📦 {sauda.commodity}</div>
                                <div>⚖️ {sauda.tons} Tons</div>
                                <div className="font-semibold text-green-600">
                                  💰 ₹{sauda.finalRate}
                                </div>
                                <div>👤 {sauda.sellerName}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Suspense>
  );
};

export default SaudaEntryList;
