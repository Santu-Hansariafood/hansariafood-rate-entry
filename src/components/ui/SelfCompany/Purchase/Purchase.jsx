"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import {
  Calendar,
  Hash,
  Package,
  Leaf,
  MapPin,
  IndianRupee,
  User,
  Tag,
  Save,
} from "lucide-react";

const parseDateString = (dateString) => {
  if (!dateString) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split("-").map(Number);
    return new Date(y, m - 1, d);
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
  const [tagInputs, setTagInputs] = useState({});

  const fetchSaudaHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/save-sauda/self-sauda?company=${encodeURIComponent(company)}${
          fromDate && toDate ? `&fromDate=${fromDate}&toDate=${toDate}` : ""
        }`
      );

      const entriesFromApi = res.data?.entries || [];
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

      let filteredEntries = allEntries.filter((e) => e.tons > 0);
      if (mode !== "combined") {
        filteredEntries = filteredEntries.filter((e) => e.type === mode);
      }

      if (fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        filteredEntries = filteredEntries.filter((e) => {
          const d = parseDateString(e.date);
          return d && d >= start && d <= end;
        });
      }

      filteredEntries.sort((a, b) => {
        const da = parseDateString(a.date);
        const db = parseDateString(b.date);
        return (db?.getTime() || 0) - (da?.getTime() || 0);
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

  const handleTagChange = (idx, value) => {
    setTagInputs((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSaveTag = async (entry, idx) => {
    try {
      await axiosInstance.put(`/save-sauda/tag-sauda/${entry.saudaNo}`, {
        tagSaudaNo: tagInputs[idx],
      });
      toast.success("Tag saved!");
    } catch (err) {
      console.error("Error saving tag:", err);
      toast.error("Failed to save tag");
    }
  };

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
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-blue-600" />
        {getModeTitle()}
      </h3>

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
              <span className="flex items-center text-sm font-medium text-gray-700 w-32">
                <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                {formatDate(entry.date)}
              </span>

              <span className="flex items-center text-sm font-semibold text-blue-600 w-20">
                <Hash className="w-4 h-4 mr-1 text-blue-400" />
                {entry.saudaNo}
              </span>

              {entry.tons > 0 && (
                <span className="flex items-center text-sm text-gray-700 w-24">
                  <Package className="w-4 h-4 mr-1 text-gray-500" />
                  {entry.tons} Tons
                </span>
              )}

              <span className="flex items-center text-sm text-gray-700 w-28 truncate">
                <Leaf className="w-4 h-4 mr-1 text-green-500" />
                {entry.commodity}
              </span>

              <span className="flex items-center text-sm text-gray-600 w-20">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                {entry.unit}
              </span>

              <span
                className={`flex items-center text-sm font-medium w-24 ${
                  entry.type === "purchase" ? "text-red-600" : "text-green-600"
                }`}
              >
                <IndianRupee className="w-4 h-4 mr-1" />
                {entry.finalRate}
              </span>

              <span className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1 text-gray-500" />
                {entry.sellerName} ({entry.sellerCompany})
              </span>
              <span className="flex items-center text-sm text-purple-700 font-semibold w-32">
                Purchase Amount
                <IndianRupee className="w-4 h-4 mr-1 text-purple-500" />
                {(
                  (Number(entry.tons) || 0) * (Number(entry.finalRate) || 0)
                ).toLocaleString()}
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tag Sauda No"
                  value={tagInputs[idx] || ""}
                  onChange={(e) => handleTagChange(idx, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleSaveTag(entry, idx)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded font-semibold ${
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
