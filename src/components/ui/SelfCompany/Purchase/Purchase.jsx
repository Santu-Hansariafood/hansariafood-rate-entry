"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const Purchase = ({ company }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch purchase history
  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/save-sauda?company=${encodeURIComponent(company)}`
      );
      const entry = res.data?.entry;

      if (entry?.saudaEntries) {
        // flatten ALL units + items into one list
        const allEntries = Object.entries(entry.saudaEntries).flatMap(
          ([unit, list]) =>
            list.map((item) => ({
              date: entry.date,
              unit,
              ...item,
            }))
        );

        // sort: newest first
        allEntries.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setEntries(allEntries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error("Error fetching purchase history:", err);
      toast.error("Failed to load purchase history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) fetchPurchaseHistory();
  }, [company]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Purchase History</h3>

      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No purchase history found.</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border"
            >
              {/* Date */}
              <span className="text-sm font-medium text-gray-700 w-28">
                {entry.date}
              </span>

              {/* Editable Sauda No */}
              <input
                type="text"
                defaultValue={entry.saudaNo}
                className="border px-2 py-1 rounded w-20 text-sm"
              />

              {/* Tons */}
              <span className="text-sm text-gray-700 w-16">
                {entry.tons}T
              </span>

              {/* Commodity */}
              <span className="text-sm text-gray-700 w-28 truncate">
                {entry.commodity}
              </span>

              {/* Unit */}
              <span className="text-sm text-gray-600 w-16">{entry.unit}</span>

              {/* Final Rate */}
              <span className="text-sm text-gray-700 w-20">
                ₹{entry.finalRate}
              </span>

              {/* Seller */}
              <span className="text-sm text-gray-600">
                {entry.sellerName} ({entry.sellerCompany})
              </span>

              {/* Others */}
              {entry.others && (
                <span className="text-xs text-gray-500 italic">
                  {entry.others}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Purchase;
