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
  Plus,
  X,
} from "lucide-react";

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

const Purchase = ({ company, fromDate, toDate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagInputs, setTagInputs] = useState({});
  const [allSaudaNos, setAllSaudaNos] = useState([]);

  const fetchAllTaggedSauda = async () => {
    try {
      const res = await axiosInstance.get("/save-sauda/tag-sauda");
      if (Array.isArray(res.data)) {
        setAllSaudaNos(res.data.map((t) => t.saudaNo));
      }
    } catch (err) {
      console.error("Error fetching all tag sauda:", err);
    }
  };

  useEffect(() => {
    fetchAllTaggedSauda();
  }, []);

  const fetchTagSaudaDetail = async (saudaNo) => {
    try {
      const res = await axiosInstance.get(`/save-sauda/tag-sauda/${saudaNo}`);
      return res.data;
    } catch (err) {
      console.error("No tag sauda found for:", saudaNo, err);
      return null;
    }
  };

  const fetchSaudaHistory = async () => {
    try {
      setLoading(true);
      const dateParams =
        fromDate && toDate ? `&fromDate=${fromDate}&toDate=${toDate}` : "";

      const purchaseReq = axiosInstance.get(
        `/save-sauda/self-sauda?company=${encodeURIComponent(
          company
        )}${dateParams}`
      );
      const sellReq = axiosInstance.get(
        `/save-sauda/sell-agarwal?${dateParams}`
      );

      const [purchaseRes, sellRes] = await Promise.all([purchaseReq, sellReq]);

      const purchaseEntries = (purchaseRes.data?.entries || []).flatMap((doc) =>
        Object.entries(doc.saudaEntries).flatMap(([unit, list]) =>
          list.map((item) => ({
            date: doc.date,
            unit,
            buyer: doc.buyer || "",
            seller: doc.seller || "",
            type: "purchase",
            ...item,
          }))
        )
      );

      const sellEntries = (sellRes.data?.entries || []).map((entry) => ({
        ...entry,
        type: "sell",
      }));

      const filtered = [...purchaseEntries, ...sellEntries].filter(
        (e) => e.tons > 0
      );

      filtered.sort((a, b) => {
        const da = parseDateString(a.date);
        const db = parseDateString(b.date);
        return (db?.getTime() || 0) - (da?.getTime() || 0);
      });

      setEntries(filtered);
    } catch (err) {
      console.error("Error fetching sauda history:", err);
      toast.error("Failed to load sauda history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) fetchSaudaHistory();
  }, [company, fromDate, toDate]);

  const handleAddTagInput = (idx) => {
    setTagInputs((prev) => ({
      ...prev,
      [idx]: [...(prev[idx] || []), ""],
    }));
  };

  const handleTagChange = async (idx, tagIdx, value) => {
    setTagInputs((prev) => {
      const updated = [...(prev[idx] || [])];
      updated[tagIdx] = value;
      return { ...prev, [idx]: updated };
    });

    if (value.trim().length >= 4) {
      const detail = await fetchTagSaudaDetail(value.trim());
      setEntries((prev) => {
        const updated = [...prev];
        if (!updated[idx].taggedBoxDetails) updated[idx].taggedBoxDetails = {};
        updated[idx].taggedBoxDetails[tagIdx] = detail;
        return updated;
      });
    }
  };

  const handleRemoveTagInput = (idx, tagIdx) => {
    setTagInputs((prev) => {
      const updated = [...(prev[idx] || [])];
      updated.splice(tagIdx, 1);
      return { ...prev, [idx]: updated };
    });
  };

  const handleSaveTags = async (entry, idx) => {
    try {
      const saudaNumbers = (tagInputs[idx] || []).filter(
        (t) => t.trim() !== ""
      );
      if (saudaNumbers.length === 0) {
        toast.error("Please enter at least one valid sauda number");
        return;
      }
      const payload = {
        saudaNo: entry.saudaNo,
        date: entry.date,
        unit: entry.unit,
        buyer: entry.buyer || "",
        seller: entry.seller || "",
        sellerName: entry.sellerName || "",
        sellerCompany: entry.sellerCompany || "",
        commodity: entry.commodity,
        tons: entry.tons,
        finalRate: entry.finalRate,
        type: entry.type,
        tagSaudaNo: saudaNumbers,
        taggedBy: company || "system",
      };

      const res = await axiosInstance.put(
        `/save-sauda/tag-sauda/${entry.saudaNo}`,
        payload
      );
      toast.success("Tags saved successfully!");

      const updated = [...entries];
      updated[idx].taggedDetails = res.data.entry;
      setEntries(updated);
    } catch (err) {
      console.error("Error saving tags:", err);
      toast.error(
        "Failed to save tags: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const purchaseEntries = entries.filter((e) => e.type === "purchase");
  const sellEntries = entries.filter((e) => e.type === "sell");

  const renderEntryCard = (entry, idx) => (
    <div
      key={idx}
      className={`flex flex-col gap-3 bg-white px-4 py-3 rounded-xl shadow-md border ${
        entry.type === "purchase"
          ? "border-l-4 border-l-blue-500"
          : "border-l-4 border-l-red-500"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center text-gray-700">
          <Calendar className="w-4 h-4 mr-1 text-gray-500" />
          {formatDate(entry.date)}
        </span>
        <span className="flex items-center font-semibold text-blue-600">
          <Hash className="w-4 h-4 mr-1 text-blue-400" />
          {entry.saudaNo}
        </span>
        {entry.tons > 0 && (
          <span className="flex items-center text-gray-700">
            <Package className="w-4 h-4 mr-1 text-gray-500" />
            {entry.tons} Tons
          </span>
        )}
        <span className="flex items-center text-gray-700 truncate">
          <Leaf className="w-4 h-4 mr-1 text-green-500" />
          {entry.commodity}
        </span>
        <span className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {entry.unit}
        </span>
        <span
          className={`flex items-center font-medium ${
            entry.type === "purchase" ? "text-red-600" : "text-green-600"
          }`}
        >
          <IndianRupee className="w-4 h-4 mr-1" />
          {entry.finalRate}
        </span>
        <span className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-1 text-gray-500" />
          {entry.sellerName} ({entry.sellerCompany})
        </span>
      </div>

      <div className="space-y-2">
        <datalist id="sauda-options">
          {allSaudaNos.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        {(tagInputs[idx] || [""]).map((tag, tagIdx) => (
          <div key={tagIdx} className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Tag Sauda No ${tagIdx + 1}`}
                value={tag}
                onChange={(e) => handleTagChange(idx, tagIdx, e.target.value)}
                className="border rounded-lg px-3 py-1 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => handleRemoveTagInput(idx, tagIdx)}
                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <X className="w-4 h-4" />
              </button>
              {tagIdx === (tagInputs[idx]?.length || 1) - 1 && (
                <button
                  onClick={() => handleAddTagInput(idx)}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => handleSaveTags(entry, idx)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" /> Save Tags
        </button>
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
    </div>
  );

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-blue-600" /> Purchase & Sell History
      </h3>

      {loading ? (
        <Loading />
      ) : entries.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No entries found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left side - Purchase */}
          <div>
            <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-1">
              <Package className="w-4 h-4" /> Purchase
            </h4>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {purchaseEntries.map((entry, idx) => renderEntryCard(entry, idx))}
            </div>
          </div>
          <div>
            <h4 className="text-red-600 font-semibold mb-2 flex items-center gap-1">
              <Package className="w-4 h-4" /> Sell
            </h4>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {sellEntries.map((entry, idx) => renderEntryCard(entry, idx))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchase;
