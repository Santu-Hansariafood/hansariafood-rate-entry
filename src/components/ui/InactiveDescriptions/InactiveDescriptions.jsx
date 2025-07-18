"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("@/components/common/Title/Title"));

const InactiveDescriptions = () => {
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(15);

  useEffect(() => {
    const fetchInactive = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/save-sauda/description-stats?days=${days}`
        );
        if (res.status !== 200) {
          throw new Error("Failed to fetch inactive descriptions");
        }
        setDescriptions(res.data || []);
      } catch (err) {
        console.error("Error fetching inactive descriptions:", err);
        setDescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInactive();
  }, [days]);

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <Title text={`Sauda is Not Done Yet ${days} Days`} />
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Last 7 Days</option>
          <option value={15}>Last 15 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : descriptions.length === 0 && !loading ? (
        <p className="text-gray-500 text-center">
          No inactive descriptions found.
        </p>
      ) : descriptions.length === 0 ? (
        <p className="text-gray-500 text-center">
          All descriptions are recently used.
        </p>
      ) : (
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
      )}
    </div>
  );
};

export default InactiveDescriptions;
