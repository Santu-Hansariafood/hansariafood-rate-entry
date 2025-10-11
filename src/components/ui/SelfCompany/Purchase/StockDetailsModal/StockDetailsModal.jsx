"use client";

import { useState, useEffect } from "react";
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
  const [loadingData, setLoadingData] = useState(true);

  // Fetch existing tag data for each entry
  useEffect(() => {
    const fetchTagData = async () => {
      setLoadingData(true);
      try {
        const promises = entries.map(async (entry, index) => {
          const saudaNo = getSaudaNumber(entry);
          if (saudaNo === "-") return null;

          try {
            // Use the correct query parameter format for the API
            const res = await axiosInstance.get(
              `/save-sauda/tag-sauda?saudaNo=${saudaNo}`
            );
            if (res.data && res.data.length > 0) {
              const tagData = res.data[0]; // Get the first matching entry

              // Set linked saudas from existing data
              const linkedData =
                type === "purchase"
                  ? tagData.sellLinkedSauda || []
                  : tagData.purchaseLinkedSauda || [];

              if (linkedData.length > 0) {
                setLinkedSaudas((prev) => ({
                  ...prev,
                  [index]: linkedData,
                }));

                // Calculate tagged quantity for this entry
                const linkedEntries = entries.filter((e) => {
                  const entryNo = getSaudaNumber(e);
                  return linkedData.includes(entryNo) && entryNo !== "-";
                });

                const totalQty = linkedEntries.reduce(
                  (sum, e) => sum + (e.tons || 0),
                  0
                );
                setTaggedQuantities((prev) => ({
                  ...prev,
                  [index]: totalQty,
                }));
              }
            }
          } catch (error) {
            console.error(`Error fetching tag data for ${saudaNo}:`, error);
          }
        });

        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching tag data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchTagData();
  }, [entries, type]);

  const getSaudaNumber = (entry) => {
    if (type === "purchase") return entry.saudaNo || "-";
    if (type === "sale" || type === "sell")
      return entry.sellSaudaNo || entry.saudaNo || "-";
    return "-";
  };

  // Add tag on comma or Enter
  const handleTagInput = (index, value) => {
    const parts = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      // Update linked saudas
      const newLinkedSaudas = {
        ...linkedSaudas,
        [index]: [...(linkedSaudas[index] || []), ...parts],
      };
      setLinkedSaudas(newLinkedSaudas);

      // Calculate tagged quantity
      updateTaggedQuantity(index, newLinkedSaudas[index]);

      document.getElementById(`tagInput-${index}`).value = "";
    }
  };

  // Remove tag
  const handleRemoveTag = (index, tag) => {
    const updatedTags = (linkedSaudas[index] || []).filter((t) => t !== tag);

    // Update linked saudas
    setLinkedSaudas((prev) => ({
      ...prev,
      [index]: updatedTags,
    }));

    // Recalculate tagged quantity
    updateTaggedQuantity(index, updatedTags);
  };

  // Update tagged quantity based on linked saudas
  const updateTaggedQuantity = (index, tags) => {
    // Find matching entries for the tags
    const matchingEntries = entries.filter((e) => {
      const saudaNo = getSaudaNumber(e);
      return tags.includes(saudaNo);
    });

    // Calculate total tons from matching entries
    const totalTons = matchingEntries.reduce(
      (sum, e) => sum + (e.tons || 0),
      0
    );

    // Store as negative value to display with minus sign
    setTaggedQuantities((prev) => ({
      ...prev,
      [index]: -Math.abs(totalTons),
    }));
  };

  // Calculate ±10% completion
  const getStatus = (entry, taggedQty) => {
    if (!taggedQty) return "Pending";
    // Use absolute value of taggedQty since it's stored as negative
    const absTaggedQty = Math.abs(taggedQty);
    const diff = Math.abs(absTaggedQty - entry.tons);
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

    // Get the current tagged quantity for status calculation
    const currentTaggedQty = taggedQuantities[index] || 0;
    const currentStatus = getStatus(entry, currentTaggedQty);

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
      status: currentStatus,
      taggedBy: "system",
    };

    try {
      setLoadingIndex(index);
      const res = await axiosInstance.post("/save-sauda/tag-sauda", payload);

      if (res.data.entry) {
        toast.success("Tag Sauda saved successfully!");

        // Update the UI with the latest status
        if (currentStatus === "Complete") {
          toast.info("This sauda is now marked as Complete!");
        }
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
              {loadingData ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Loading sauda data...
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => {
                  const tags = linkedSaudas[i] || [];
                  const taggedQty = taggedQuantities[i] || 0;
                  const status = getStatus(e, taggedQty);
                  const percentComplete =
                    e.tons > 0 ? Math.min(100, (taggedQty / e.tons) * 100) : 0;

                  // Calculate if within 10% tolerance
                  const diff = Math.abs(taggedQty - e.tons);
                  const tolerance = e.tons * 0.1;
                  const isWithinTolerance = diff <= tolerance;

                  return (
                    <tr
                      key={i}
                      className={`border-t hover:bg-gray-50 transition-colors relative ${
                        isWithinTolerance ? "bg-green-50" : ""
                      }`}
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
                              <span className="font-medium">Tons:</span>{" "}
                              {e.tons}
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

                        {/* Progress bar and quantity display */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">
                              Tagged:{" "}
                              <span className="font-medium">
                                -{Math.abs(taggedQty).toFixed(2)}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {e.tons.toFixed(2)}
                              </span>{" "}
                              tons
                            </span>
                            <span
                              className={
                                isWithinTolerance
                                  ? "text-green-600 font-medium"
                                  : "text-gray-600"
                              }
                            >
                              {Math.abs(percentComplete).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                isWithinTolerance
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.abs(percentComplete)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-right text-gray-700">
                        {e.tons}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-800">
                        {e.finalRate || "-"}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            status === "Complete"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
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
                              : status === "Complete"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-blue-500 hover:bg-blue-600"
                          } text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 mx-auto`}
                        >
                          <Save className="w-3 h-3" />
                          {loadingIndex === i ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockDetailsModal;
