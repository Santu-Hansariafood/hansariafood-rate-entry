"use client";

import React, { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, IndianRupee, Clock4 } from "lucide-react";
import useRateEntries from "@/hooks/RateEntries/useRateEntries";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
const DownloadRateEntriesExcel = dynamic(() =>
  import("./DownloadRateEntriesExcel/DownloadRateEntriesExcel")
);
const Title = dynamic(() => import("@/components/common/Title/Title"));

const RateEntryList = () => {
  const { groupedRates, mobileToName, loading } = useRateEntries();
  const [expandedMobile, setExpandedMobile] = useState(null);

  const toggleExpand = (mobile) =>
    setExpandedMobile((prev) => (prev === mobile ? null : mobile));

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen p-6 bg-gray-100 dark:bg-gray-950 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto rounded-3xl border border-white/20
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                   shadow-2xl p-6 md:p-10"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <Title text="📊 Today Entries by User" />
            <DownloadRateEntriesExcel />
          </div>

          {Object.keys(groupedRates).length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20">
              No rate entries found today 📭
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedRates).map(([mobile, entries], i) => (
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
                             bg-gradient-to-r from-indigo-500/10 to-pink-500/10
                             hover:from-indigo-500/20 hover:to-pink-500/20
                             transition text-left"
                  >
                    <div>
                      <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                        {mobileToName[mobile] || mobile}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {entries.length} Entr{entries.length > 1 ? "ies" : "y"}
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
                        className="px-5 py-4 space-y-4 border-t border-white/20"
                      >
                        {entries.map((entry, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="rounded-xl p-4 bg-white/90 dark:bg-gray-900/70
                                     border border-gray-200/60 dark:border-gray-700/50
                                     shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                              <Building2 size={16} /> {entry.company}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                              <MapPin size={16} /> {entry.location}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                              <IndianRupee size={16} /> ₹{entry.newRate}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Clock4 size={14} />
                              {new Date(entry.lastUpdated).toLocaleString(
                                "en-GB"
                              )}
                            </div>
                          </motion.div>
                        ))}
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

export default RateEntryList;
