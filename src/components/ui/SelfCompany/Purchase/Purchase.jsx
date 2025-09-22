"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";

const parseDateString = (dateString) => {
  if (!dateString) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const d = new Date(dateString);
    return isNaN(d) ? null : d;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/").map(Number);
    const d = new Date(year, month - 1, day);
    return isNaN(d) ? null : d;
  }

  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return isNaN(d) ? null : d;
  }

  return null;
};

const formatDate = (dateString) => {
  const parsed = parseDateString(dateString);
  if (!parsed) return "-";
  return parsed.toLocaleDateString("en-GB");
};

const Purchase = ({ company, mode, fromDate, toDate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaudaHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/save-sauda/self-sauda?company=${encodeURIComponent(company)}${
          fromDate && toDate ? `&fromDate=${fromDate}&toDate=${toDate}` : ""
        }`
      );

      const entriesFromApi = res.data?.entries || [];
      console.log("Raw API entries:", entriesFromApi);

      const allEntries = entriesFromApi.flatMap((doc) =>
        Object.entries(doc.saudaEntries).flatMap(([unit, list]) =>
          list.map((item) => ({
            date: doc.date,
            unit,
            buyer: doc.buyer || "",
            seller: doc.seller || "",
            type: item.finalRate > 0 ? "purchase" : "sell",
            ...item,
          }))
        )
      );

      let filteredEntries = allEntries;
      filteredEntries = filteredEntries.filter((entry) => entry.tons > 0);
      if (mode !== "combined") {
        filteredEntries = filteredEntries.filter(
          (entry) => entry.type === mode
        );
      }

      if (fromDate && toDate) {
        filteredEntries = filteredEntries.filter((entry) => {
          const entryDate = parseDateString(entry.date);
          const startDate = new Date(fromDate);
          const endDate = new Date(toDate);

          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);

          return entryDate && entryDate >= startDate && entryDate <= endDate;
        });
      }
      filteredEntries.sort((a, b) => {
        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateB.getTime() - dateA.getTime();
      });

      setEntries(filteredEntries);
    } catch (err) {
      console.error("Error fetching sauda history:", err);
      toast.error("Failed to load sauda history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) fetchSaudaHistory();
  }, [company, mode, fromDate, toDate]);

  const getModeTitle = () => {
    switch (mode) {
      case "purchase":
        return "Purchase History";
      case "sell":
        return "Sell History";
      default:
        return "All Sauda History";
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{getModeTitle()}</h3>

      {loading ? (
        <Loading />
      ) : entries.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No entries found.</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className={`flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border ${
                entry.type === "purchase"
                  ? "border-l-4 border-l-blue-500"
                  : "border-l-4 border-l-red-500"
              }`}
            >
              <span className="text-sm font-medium text-gray-700 w-28">
                {formatDate(entry.date)}
              </span>
              <span className="text-sm font-semibold text-blue-600 w-20">
                #{entry.saudaNo}
              </span>
              {entry.tons > 0 && (
                <span className="text-sm text-gray-700 w-20">
                  {entry.tons} Tons
                </span>
              )}
              <span className="text-sm text-gray-700 w-28 truncate">
                {entry.commodity}
              </span>
              <span className="text-sm text-gray-600 w-16">{entry.unit}</span>
              <span
                className={`text-sm font-medium w-20 ${
                  entry.type === "purchase" ? "text-red-600" : "text-green-600"
                }`}
              >
                ₹{entry.finalRate}
              </span>
              <span className="text-sm text-gray-600">
                {entry.sellerName} ({entry.sellerCompany})
              </span>
              {(entry.buyer || entry.seller) && (
                <span className="text-xs text-gray-500 italic">
                  B: {entry.buyer || "-"} | S: {entry.seller || "-"}
                </span>
              )}
              {entry.others && (
                <span className="text-xs text-gray-500 italic">
                  {entry.others}
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded ${
                  entry.type === "purchase"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {entry.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Purchase;
