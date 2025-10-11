"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { Calendar, Hash, X, Save } from "lucide-react";

const parseDateString = (dateString) => {
  if (!dateString) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(dateString);
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

const StockDetailsModal = ({ details, onClose }) => {
  if (!details) return null;

  const { type, commodity, unit, entries } = details;
  const [linkedSaudas, setLinkedSaudas] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [taggedQuantities, setTaggedQuantities] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);

  const getSaudaNumber = (entry) => {
    if (type === "purchase") return entry.saudaNo || "-";
    if (type === "sale" || type === "sell")
      return entry.sellSaudaNo || entry.saudaNo || "-";
    return "-";
  };

  // Add tag on comma or Enter
  const handleTagInput = (index, value) => {
    const parts = value.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length > 0) {
      setLinkedSaudas((prev) => ({
        ...prev,
        [index]: [...(prev[index] || []), ...parts],
      }));
      document.getElementById(`tagInput-${index}`).value = "";
    }
  };

  // Remove tag
  const handleRemoveTag = (index, tag) => {
    setLinkedSaudas((prev) => ({
      ...prev,
      [index]: prev[index].filter((t) => t !== tag),
    }));
  };

  // Calculate ±10% completion
  const getStatus = (entry, taggedQty) => {
    if (!taggedQty) return "Pending";
    const diff = Math.abs(taggedQty - entry.tons);
    const tolerance = entry.tons * 0.1;
    return diff <= tolerance ? "Complete" : "Pending";
  };

  // --- 🧠 Save Tag Sauda to API ---
  const handleSave = async (entry, index) => {
    const tagSaudaNo = linkedSaudas[index] || [];
    if (tagSaudaNo.length === 0) {
      toast.warning("Please enter at least one Sauda number before saving.");
      return;
    }

    const payload = {
      saudaNo: getSaudaNumber(entry),
      date: entry.date,
      unit,
      buyer: entry.buyer || "",
      seller: entry.seller || "",
      sellerName: entry.sellerName || "",
      sellerCompany: entry.sellerCompany || "",
      commodity,
      tons: entry.tons,
      finalRate: entry.finalRate,
      type,
      tagSaudaNo,
      purchaseLinkedSauda: type === "purchase" ? tagSaudaNo : [],
      sellLinkedSauda: type === "sell" ? tagSaudaNo : [],
      status: getStatus(entry, entry.tons),
      taggedBy: "system",
    };

    try {
      setLoadingIndex(index);
      const res = await axiosInstance.post("/save-sauda/tag-sauda", payload);

      if (res.data.success) {
        toast.success("Tag Sauda saved successfully!");
      } else {
        toast.error(res.data.message || "Failed to save tag.");
      }
    } catch (error) {
      console.error("Error saving Tag Sauda:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setLoadingIndex(null);
    }
  };

  const labelText =
    type === "purchase"
      ? "Enter Sale Sauda No(s)"
      : "Enter Purchase Sauda No(s)";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-6xl p-6 relative animate-fadeIn">
        {/* Close */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
          {type === "purchase" ? "Purchase" : "Sale"} Details – {commodity} (
          {unit})
        </h4>

        {/* Table */}
        <div className="max-h-[500px] overflow-y-auto rounded-md border border-gray-100 relative">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-[120px]">
                  <Calendar className="w-4 h-4 inline mr-1" /> Date
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-[140px]">
                  <Hash className="w-4 h-4 inline mr-1" />{" "}
                  {type === "purchase" ? "Purchase Sauda No" : "Sale Sauda No"}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-[250px]">
                  {labelText}
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">
                  Tons
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">
                  Rate
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-[120px]">
                  Status
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-[80px]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.map((e, i) => {
                const tags = linkedSaudas[i] || [];
                const taggedQty = taggedQuantities[i] || 0;
                const status = getStatus(e, taggedQty);

                return (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-3 py-2">{formatDate(e.date)}</td>

                    {/* Sauda No Hover */}
                    <td
                      className="px-3 py-2 text-blue-600 font-medium relative"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="flex items-center gap-1 cursor-pointer">
                        <Hash className="w-4 h-4 text-blue-400" />
                        {getSaudaNumber(e)}
                      </div>

                      {hoveredIndex === i && (
                        <div className="absolute left-0 top-8 bg-white border border-gray-300 shadow-lg rounded-lg p-3 text-xs w-60 z-50 animate-fadeIn">
                          <p className="font-semibold text-gray-700 mb-1">
                            Sauda Details
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(e.date)}
                          </p>
                          <p>
                            <span className="font-medium">Tons:</span> {e.tons}
                          </p>
                          <p>
                            <span className="font-medium">Rate:</span>{" "}
                            {e.finalRate || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Type:</span>{" "}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Tags Input */}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                            <X
                              className="ml-1 w-3 h-3 cursor-pointer hover:text-red-500"
                              onClick={() => handleRemoveTag(i, tag)}
                            />
                          </span>
                        ))}
                      </div>
                      <input
                        id={`tagInput-${i}`}
                        type="text"
                        placeholder="Enter Sauda No and press comma"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleTagInput(i, e.currentTarget.value);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tagged Quantity:{" "}
                        <span className="font-medium text-gray-700">
                          {taggedQty} tons
                        </span>
                      </p>
                    </td>

                    <td className="px-3 py-2 text-right text-gray-700">
                      {e.tons}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-800">
                      {e.finalRate || "-"}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">
                      <span
                        className={
                          status === "Complete"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleSave(e, i)}
                        disabled={loadingIndex === i}
                        className={`${
                          loadingIndex === i
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 mx-auto`}
                      >
                        <Save className="w-3 h-3" />
                        {loadingIndex === i ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockDetailsModal;
