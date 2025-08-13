"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useInactiveDescriptions } from "@/hooks/InactiveDescriptions/useInactiveDescriptions";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const ITEMS_PER_PAGE = 10;

export default function InactiveDescriptions() {
  const [days, setDays] = useState(15);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { descriptions, loading } = useInactiveDescriptions(days);

  const dayOptions = useMemo(() => [7, 15, 30], []);

  const handleDaysChange = useCallback((e) => {
    setDays(Number(e.target.value));
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const showMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const processedList = useMemo(() => {
    return descriptions.map((desc) => {
      const lastUsed = desc.lastUsedDate ? dayjs(desc.lastUsedDate) : null;
      const daysAgo = lastUsed ? dayjs().diff(lastUsed, "day") : null;

      let status = { icon: null, text: null, highlight: false };

      if (daysAgo === null || daysAgo > 21) {
        status = {
          icon: <ArrowDown className="text-red-500 animate-bounce" size={20} />,
          text: (
            <span className="ml-2 text-xs font-bold text-red-500 animate-pulse">
              Needs Attention
            </span>
          ),
          highlight: true,
        };
      } else if (daysAgo > 7) {
        status = {
          icon: <ArrowDown className="text-red-500" size={20} />,
        };
      } else {
        status = {
          icon: <ArrowUp className="text-green-500" size={20} />,
        };
      }

      return {
        ...desc,
        lastUsed,
        daysAgo,
        status,
      };
    });
  }, [descriptions]);

  const renderList = useMemo(() => {
    if (loading) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Loading...
        </p>
      );
    }

    if (processedList.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          All Party Sauda are recently used.
        </p>
      );
    }

    return (
      <Suspense fallback={<Loading />}>
        <ul className="space-y-4">
          {processedList.slice(0, visibleCount).map((desc, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl p-5 flex justify-between items-center transition-all shadow-sm hover:shadow-lg border ${
                desc.status.highlight
                  ? "border-red-400 bg-red-50 dark:bg-red-900/30"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              }`}
            >
              <div>
                <p className="text-lg font-semibold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
                  {desc.description}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  Last used:{" "}
                  {desc.lastUsed
                    ? desc.lastUsed.format("DD MMM YYYY")
                    : "Never"}
                  {desc.status.icon}
                  {desc.status.text}
                </p>
              </div>
              <div className="text-sm text-right text-gray-700 dark:text-gray-300">
                <p className="font-medium">Count: {desc.count}</p>
                <p className="mt-1">Qty: {desc.totalQuantity} tons</p>
              </div>
            </motion.li>
          ))}
        </ul>

        {visibleCount < processedList.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={showMore}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            >
              See More
            </button>
          </div>
        )}
      </Suspense>
    );
  }, [loading, processedList, visibleCount, showMore]);

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
