"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useInactiveDescriptions } from "@/hooks/InactiveDescriptions/useInactiveDescriptions";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const ITEMS_PER_PAGE = 10;

export default function InactiveDescriptions() {
  const [days, setDays] = useState(15);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { descriptions, loading } = useInactiveDescriptions(days);

  const dayOptions = useMemo(() => [7, 15, 30], []);

  const handleDaysChange = useCallback((e) => {
    setDays(parseInt(e.target.value));
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const showMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const renderList = useMemo(() => {
    if (loading) {
      return <p className="text-gray-500 dark:text-gray-400 text-center">Loading...</p>;
    }

    if (descriptions.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          All Party Sauda are recently used.
        </p>
      );
    }

    return (
      <>
        <ul className="space-y-4">
          {descriptions.slice(0, visibleCount).map((desc, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md hover:border-green-400 transition-all"
            >
              <div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  {desc.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last used:{" "}
                  {desc.lastUsedDate
                    ? dayjs(desc.lastUsedDate).format("DD MMM YYYY")
                    : "Never"}
                </p>
              </div>
              <div className="text-sm text-right text-gray-700 dark:text-gray-300">
                <p>Count: {desc.count}</p>
                <p>Qty: {desc.totalQuantity} tons</p>
              </div>
            </motion.li>
          ))}
        </ul>

        {visibleCount < descriptions.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={showMore}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            >
              See More
            </button>
          </div>
        )}
      </>
    );
  }, [loading, descriptions, visibleCount]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <Title text={`Sauda is Not Done Yet ${days} Days`} />
            <select
              value={days}
              onChange={handleDaysChange}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              {dayOptions.map((option) => (
                <option key={option} value={option}>
                  Last {option} Days
                </option>
              ))}
            </select>
          </div>

          {renderList}
        </div>
      </div>
    </Suspense>
  );
}
