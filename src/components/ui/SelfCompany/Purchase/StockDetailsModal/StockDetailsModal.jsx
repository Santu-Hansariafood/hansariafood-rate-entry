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
  const [saudaStatuses, setSaudaStatuses] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const [saudaDetails, setSaudaDetails] = useState({});
  const [detailsBySaudaNo, setDetailsBySaudaNo] = useState({});

  useEffect(() => {
    const fetchTagData = async () => {
      setLoadingData(true);
      try {
        const promises = entries.map(async (entry, index) => {
          const saudaNo = getSaudaNumber(entry);
          if (saudaNo === "-") return null;

          try {
            const res = await axiosInstance.get(
              `/save-sauda/tag-sauda?saudaNo=${saudaNo}`
            );
            if (res.data && res.data.length > 0) {
              const tagData = res.data[0];
              setSaudaStatuses((prev) => ({
                ...prev,
                [index]: tagData.status || "Pending",
              }));
              try {
                const detailRes = await axiosInstance.get(
                  `/sauda/getSaudaByNumber`,
                  {
                    params: { saudaNumber: saudaNo },
                  }
                );
                const primaryData = detailRes.data?.data || null;
                if (primaryData) {
                  setDetailsBySaudaNo((prev) => ({
                    ...prev,
                    [saudaNo]: primaryData,
                  }));
                }
              } catch (primaryErr) {
                console.error(
                  `Error fetching primary sauda details for ${saudaNo}:`,
                  primaryErr
                );
              }

              const linkedData =
                type === "purchase"
                  ? tagData.sellLinkedSauda || []
                  : tagData.purchaseLinkedSauda || [];

              if (linkedData.length > 0) {
                const sortedLinkedData = [...linkedData].sort((a, b) => {
                  const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                  const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                  return numA - numB;
                });

                setLinkedSaudas((prev) => ({
                  ...prev,
                  [index]: sortedLinkedData,
                }));

                const detailsPromises = sortedLinkedData.map(
                  async (linkedSauda) => {
                    try {
                      const detailRes = await axiosInstance.get(
                        `/sauda/getSaudaByNumber`,
                        {
                          params: { saudaNumber: linkedSauda },
                        }
                      );
                      const data = detailRes.data?.data || null;
                      if (data) {
                        setDetailsBySaudaNo((prev) => ({
                          ...prev,
                          [linkedSauda]: data,
                        }));
                        return { saudaNo: linkedSauda, details: data };
                      }
                      return { saudaNo: linkedSauda, details: null };
                    } catch (error) {
                      console.error(
                        `Error fetching details for ${linkedSauda}:`,
                        error
                      );
                      return { saudaNo: linkedSauda, details: null };
                    }
                  }
                );

                const detailsResults = await Promise.all(detailsPromises);
                const detailsMap = {};
                detailsResults.forEach((result) => {
                  if (result.details) {
                    detailsMap[result.saudaNo] = result.details;
                  }
                });

                setSaudaDetails((prev) => ({
                  ...prev,
                  [index]: detailsMap,
                }));

                const oppositeEntries = entries.filter((e) => {
                  if (e === entry) return false;
                  const entryNo = getSaudaNumber(e);
                  return sortedLinkedData.includes(entryNo) && entryNo !== "-";
                });

                const totalQty = oppositeEntries.reduce(
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

  const handleTagInput = (index, value) => {
    const parts = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });

    if (parts.length > 0) {
      const existingTags = linkedSaudas[index] || [];
      const newTags = parts.filter((tag) => !existingTags.includes(tag));

      if (newTags.length === 0) {
        toast.warning("This sauda number is already added.");
        document.getElementById(`tagInput-${index}`).value = "";
        return;
      }

      const newLinkedSaudas = {
        ...linkedSaudas,
        [index]: [...existingTags, ...newTags].sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.match(/\d+/)?.[0] || 0);
          return numA - numB;
        }),
      };

      setLinkedSaudas(newLinkedSaudas);
      updateTaggedQuantity(index, newLinkedSaudas[index]);
      document.getElementById(`tagInput-${index}`).value = "";

      newTags.forEach(async (tag) => {
        try {
          const res = await axiosInstance.get(`/sauda/getSaudaByNumber`, {
            params: { saudaNumber: tag },
          });
          const data = res.data?.data;
          if (data) {
            setDetailsBySaudaNo((prev) => ({ ...prev, [tag]: data }));
            setSaudaDetails((prev) => {
              const currentIndexMap = prev[index] ? { ...prev[index] } : {};
              currentIndexMap[tag] = data;
              return { ...prev, [index]: currentIndexMap };
            });
          }
        } catch (err) {
          console.error(`Failed to fetch sauda details for ${tag}:`, err);
        }
      });
    }
  };

  const handleRemoveTag = (index, tag) => {
    const updatedTags = (linkedSaudas[index] || []).filter((t) => t !== tag);

    setLinkedSaudas((prev) => ({
      ...prev,
      [index]: updatedTags,
    }));

    updateTaggedQuantity(index, updatedTags);
  };

  const updateTaggedQuantity = (index, tags) => {
    const currentEntry = entries[index];

    const oppositeEntries = entries.filter((e) => {
      if (e === currentEntry) return false;

      const saudaNo = getSaudaNumber(e);
      return tags.includes(saudaNo);
    });

    const totalTons = oppositeEntries.reduce(
      (sum, e) => sum + (e.tons || 0),
      0
    );
    setTaggedQuantities((prev) => ({
      ...prev,
      [index]: totalTons,
    }));
  };

  const getStatus = (entry, taggedQty) => {
    if (!taggedQty) return "Pending";
    const diff = Math.abs(taggedQty - entry.tons);
    const tolerance = entry.tons * 0.1;
    return diff <= tolerance ? "Complete" : "Pending";
  };

  const handleSave = async (entry, index) => {
    const tagSaudaNo = linkedSaudas[index] || [];
    if (tagSaudaNo.length === 0) {
      toast.warning("Please enter at least one Sauda number before saving.");
      return;
    }

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
        setSaudaStatuses((prev) => ({
          ...prev,
          [index]: res.data.entry.status || currentStatus,
        }));

        if (currentStatus === "Complete") {
          toast.info("This sauda is now marked as Complete!");
        }

        const saudaNo = getSaudaNumber(entry);
        try {
          const refreshRes = await axiosInstance.get(
            `/save-sauda/tag-sauda?saudaNo=${saudaNo}`
          );

          if (refreshRes.data && refreshRes.data.length > 0) {
            const tagData = refreshRes.data[0];

            setSaudaStatuses((prev) => ({
              ...prev,
              [index]: tagData.status || "Pending",
            }));

            const linkedData =
              type === "purchase"
                ? tagData.sellLinkedSauda || []
                : tagData.purchaseLinkedSauda || [];

            if (linkedData.length > 0) {
              const sortedLinkedData = [...linkedData].sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                return numA - numB;
              });

              setLinkedSaudas((prev) => ({
                ...prev,
                [index]: sortedLinkedData,
              }));
            }
          }
        } catch (refreshError) {
          console.error(
            `Error refreshing tag data for ${saudaNo}:`,
            refreshError
          );
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
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
          {type === "purchase" ? "Purchase" : "Sale"} Details – {commodity} (
          {unit})
        </h4>

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
                  const status = saudaStatuses[i] || getStatus(e, taggedQty);
                  const percentComplete =
                    e.tons > 0 ? Math.min(100, (taggedQty / e.tons) * 100) : 0;

                  const diff = Math.abs(taggedQty - e.tons);
                  const tolerance = e.tons * 0.1;
                  const isWithinTolerance =
                    diff <= tolerance || status === "Complete";
                  const mainDetails = detailsBySaudaNo[getSaudaNumber(e)];

                  return (
                    <tr
                      key={i}
                      className={`border-t hover:bg-gray-50 transition-colors relative ${
                        isWithinTolerance ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="px-3 py-2">{formatDate(e.date)}</td>

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
                          <div className="absolute left-0 top-8 bg-white border border-gray-300 shadow-lg rounded-lg p-3 text-xs w-64 z-50 animate-fadeIn">
                            <p className="font-semibold text-gray-700 mb-1">
                              Sauda Details
                            </p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              <span className="text-gray-500">Date:</span>
                              <span className="font-medium">
                                {formatDate(mainDetails?.date ?? e.date)}
                              </span>

                              <span className="text-gray-500">Tons:</span>
                              <span className="font-medium">
                                {(mainDetails?.tons ?? e.tons)?.toFixed
                                  ? (mainDetails?.tons ?? e.tons)?.toFixed(2)
                                  : mainDetails?.tons ?? e.tons}
                              </span>

                              <span className="text-gray-500">Rate:</span>
                              <span className="font-medium">
                                {mainDetails?.finalRate ?? e.finalRate ?? "-"}
                              </span>

                              <span className="text-gray-500">Commodity:</span>
                              <span className="font-medium">
                                {mainDetails?.commodity ?? e.commodity ?? "-"}
                              </span>

                              <span className="text-gray-500">Unit:</span>
                              <span className="font-medium">
                                {mainDetails?.unit ?? e.unit ?? "-"}
                              </span>

                              {mainDetails?.sellerName && (
                                <>
                                  <span className="text-gray-500">Seller:</span>
                                  <span className="font-medium">
                                    {mainDetails.sellerName}
                                  </span>
                                </>
                              )}
                              {mainDetails?.sellerCompany && (
                                <>
                                  <span className="text-gray-500">
                                    Seller Co.:
                                  </span>
                                  <span className="font-medium">
                                    {mainDetails.sellerCompany}
                                  </span>
                                </>
                              )}

                              <span className="text-gray-500">Status:</span>
                              <span
                                className={`font-medium ${
                                  status === "Complete"
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {mainDetails?.status ?? status}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`flex items-center ${
                                status === "Complete"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              } px-2 py-1 rounded-full text-xs font-medium`}
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
                          placeholder={`Enter ${
                            type === "purchase" ? "Sale" : "Purchase"
                          } Sauda No and press Enter`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleTagInput(i, e.currentTarget.value);
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">
                              Tagged:{" "}
                              <span
                                className={`font-medium ${
                                  status === "Complete" ? "text-green-600" : ""
                                }`}
                              >
                                {taggedQty.toFixed(2)}
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
                                  ? "text-green-600 font-bold"
                                  : "text-gray-600"
                              }
                            >
                              Status: {status}
                            </span>
                          </div>
                          {tags.length > 0 && (
                            <div className="mt-2 border rounded-md p-2 bg-gray-50">
                              <p className="text-xs font-medium text-gray-700 mb-2 border-b pb-1">
                                Linked Sauda Details:
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {tags.map((tag, idx) => {
                                  const details = saudaDetails[i]?.[tag];
                                  return (
                                    <div
                                      key={idx}
                                      className="text-xs bg-white p-1 rounded border border-gray-200 shadow-sm"
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-500 text-[10px]">
                                          Sauda No.
                                        </span>
                                        <span className="font-medium text-blue-600">
                                          {tag}
                                        </span>
                                      </div>
                                      {details && (
                                        <div className="mt-1 pt-1 border-t border-gray-100">
                                          <div className="grid grid-cols-2 gap-1">
                                            <div className="text-gray-500">
                                              Date:
                                            </div>
                                            <div className="font-medium">
                                              {formatDate(details.date)}
                                            </div>
                                            <div className="text-gray-500">
                                              Company:
                                            </div>
                                            <div className="font-medium">
                                              {details.company || "-"}
                                            </div>
                                            <div className="text-gray-500">
                                              Buyer:
                                            </div>
                                            <div className="font-medium">
                                              {details.buyer || "-"}
                                            </div>
                                            <div className="text-gray-500">
                                              Seller:
                                            </div>
                                            <div className="font-medium">
                                              {details.seller || "-"}
                                            </div>

                                            <div className="text-gray-500">
                                              Tons:
                                            </div>
                                            <div className="font-medium">
                                              {details.tons?.toFixed(2) || "-"}
                                            </div>

                                            <div className="text-gray-500">
                                              Rate:
                                            </div>
                                            <div className="font-medium">
                                              {details.finalRate || "-"}
                                            </div>

                                            <div className="text-gray-500">
                                              Status:
                                            </div>
                                            <div
                                              className={`font-medium ${
                                                details.status === "Complete"
                                                  ? "text-green-600"
                                                  : "text-blue-600"
                                              }`}
                                            >
                                              {details.status || "Pending"}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
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
