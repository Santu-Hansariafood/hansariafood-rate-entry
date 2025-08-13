"use client";

import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import { useTopDescriptions } from "@/hooks/TopDescriptions/useTopDescriptions";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const TopSaudaList = () => {
  const [days, setDays] = useState(7);
  const dayOptions = useMemo(() => [7, 14, 30], []);
  const { topList, loading, hasMore, loadMore } = useTopDescriptions(days);

  const getStatusIcon = (lastUsedDate) => {
    if (!lastUsedDate) return null;

    const today = dayjs().startOf("day");
    const lastDate = dayjs(lastUsedDate).startOf("day");
    const diff = today.diff(lastDate, "day");

    if (diff === 0) {
      return (
        <motion.span
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          title="Updated today"
        >
          <ArrowUpCircle className="text-green-500 dark:text-green-400 w-5 h-5" />
        </motion.span>
      );
    } else if (diff > 3) {
      return (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          title="Not updated for more than 3 days"
        >
          <ArrowDownCircle className="text-red-500 dark:text-red-400 w-5 h-5" />
        </motion.span>
      );
    }
    return null;
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Title text={`Top Sauda Taken in Last ${days} Days`} />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {dayOptions.map((option) => (
                <option key={option} value={option}>
                  Last {option} Days
                </option>
              ))}
            </select>
          </div>
          {topList.length === 0 && loading ? (
            <Loading />
          ) : topList.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No top descriptions found.
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {topList.map((item, index) => {
                  const icon = getStatusIcon(item.lastUsedDate);
                  return (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-green-600 dark:text-green-400 break-words">
                              {item.description}
                            </p>
                            {icon}
                          </div>
                          <p className="text-sm italic text-red-500 dark:text-red-400 mt-1">
                            Last Sauda:{" "}
                            {item.lastUsedDate
                              ? dayjs(item.lastUsedDate).format("DD MMM YYYY")
                              : "Never"}
                          </p>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 shadow-inner min-w-[140px] text-right">
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            Sauda Taken:{" "}
                            <span className="text-blue-600 dark:text-blue-400">
                              {item.count}
                            </span>
                          </p>
                          <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                            Qty:{" "}
                            <span className="text-purple-600 dark:text-purple-400">
                              {item.totalQuantity} Tons
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-md transition disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default TopSaudaList;
