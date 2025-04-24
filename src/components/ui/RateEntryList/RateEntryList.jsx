"use client";

import React, { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, IndianRupee, Clock4 } from "lucide-react";
import useRateEntries from "@/hooks/RateEntries/useRateEntries";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const RateEntryList = () => {
  const { groupedRates, mobileToName, loading } = useRateEntries();
  const [expandedMobile, setExpandedMobile] = useState(null);

  const toggleExpand = (mobile) =>
    setExpandedMobile((prev) => (prev === mobile ? null : mobile));

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="📊 Today Entries by User" />
        {Object.keys(groupedRates).length === 0 ? (
          <div className="text-center text-gray-500">
            No rate entries found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(groupedRates).map(([mobile, entries]) => (
              <motion.div
                key={mobile}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-lg hover:shadow-xl transition duration-300"
              >
                <button
                  className="w-full p-4 flex justify-between items-center text-left rounded-t-2xl bg-indigo-50 hover:bg-indigo-100"
                  onClick={() => toggleExpand(mobile)}
                >
                  <span className="font-semibold text-indigo-700">
                    {mobileToName[mobile] || mobile}
                  </span>
                  <span className="text-sm text-gray-600">
                    {entries.length} entr{entries.length > 1 ? "ies" : "y"}
                  </span>
                </button>

                <AnimatePresence>
                  {expandedMobile === mobile && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t p-4 space-y-3 overflow-hidden"
                    >
                      {entries.map((entry, idx) => (
                        <motion.div
                          key={idx}
                          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="text-sm flex items-center gap-2 text-blue-700 font-medium">
                            <Building2 size={16} /> 
                            <strong>Company:</strong> {entry.company}
                          </div>
                          <div className="text-sm flex items-center gap-2 text-purple-700">
                            <MapPin size={16} /> 
                            <strong>Location:</strong> {entry.location}
                          </div>
                          <div className="text-sm flex items-center gap-2 text-green-600 font-semibold">
                            <IndianRupee size={16} />
                            <strong>Rate:</strong> ₹{entry.newRate}
                          </div>
                          <div className="text-sm flex items-center gap-2 text-gray-500">
                            <Clock4 size={16} />
                            <strong>Updated:</strong>{" "}
                            {new Date(entry.lastUpdated).toLocaleString("en-GB")}
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
      </div>
    </Suspense>
  );
};

export default RateEntryList;
