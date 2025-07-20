"use client";

import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";

import Loading from "@/components/common/Loading/Loading";
import { useTopDescriptions } from "@/hooks/TopDescriptions/useTopDescriptions";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const TopSaudaList = () => {
  const [days, setDays] = useState(7);
  const dayOptions = useMemo(() => [7, 14, 30], []);
  const { topList, loading, hasMore, loadMore } = useTopDescriptions(days);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Title text={`Top Sauda Taken in Last ${days} Days`} />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <p className="text-center text-gray-500">
              No top descriptions found.
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {topList.map((item, index) => (
                  <li
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-100 transition-shadow shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-lg font-semibold text-green-600 break-words">
                          {item.description}
                        </p>
                        <p className="text-sm italic text-red-500 mt-1">
                          Last Sauda:{" "}
                          {item.lastUsedDate
                            ? dayjs(item.lastUsedDate).format("DD MMM YYYY")
                            : "Never"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-100 rounded-md p-3 shadow-inner min-w-[140px] text-right">
                        <p className="font-medium text-gray-800">
                          Sauda Taken:{" "}
                          <span className="text-blue-600">{item.count}</span>
                        </p>
                        <p className="font-medium text-gray-800 mt-1">
                          Qty:{" "}
                          <span className="text-purple-600">
                            {item.totalQuantity} Tons
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
