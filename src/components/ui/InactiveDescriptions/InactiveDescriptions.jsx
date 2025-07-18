"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useInactiveDescriptions } from "@/hooks/InactiveDescriptions/useInactiveDescriptions";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const InactiveDescriptions = () => {
  const [days, setDays] = useState(15);
  const { descriptions, loading } = useInactiveDescriptions(days);

  const dayOptions = useMemo(() => [7, 15, 30], []);

  const renderList = useMemo(() => {
    if (loading) {
      return <p className="text-gray-500 text-center">Loading...</p>;
    }

    if (descriptions.length === 0) {
      return (
        <p className="text-gray-500 text-center">
          All descriptions are recently used.
        </p>
      );
    }

    return (
      <ul className="space-y-4">
        {descriptions.map((desc, index) => (
          <li
            key={index}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
          >
            <div>
              <p className="text-lg font-medium text-gray-700">
                {desc.description}
              </p>
              <p className="text-sm text-gray-500">
                Last used:{" "}
                {desc.lastUsedDate
                  ? dayjs(desc.lastUsedDate).format("DD MMM YYYY")
                  : "Never"}
              </p>
            </div>
            <div className="text-sm text-right text-gray-600">
              <p>Count: {desc.count}</p>
              <p>Qty: {desc.totalQuantity} tons</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }, [loading, descriptions]);

  const handleDaysChange = useCallback((e) => {
    setDays(parseInt(e.target.value));
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4 mt-8 bg-white rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <Title text={`Sauda is Not Done Yet ${days} Days`} />
            <select
              value={days}
              onChange={handleDaysChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
};

export default InactiveDescriptions;
