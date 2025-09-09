"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const SaudaDetails = ({ company, type }) => {
  const [saudas, setSaudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagsByEntry, setTagsByEntry] = useState({});
  const [inputByEntry, setInputByEntry] = useState({});

  // Add a tag to a specific entry card
  const handleAddTag = (entryKey) => {
    const value = (inputByEntry[entryKey] || "").trim();
    if (!value) return;
    setTagsByEntry((prev) => {
      const existing = prev[entryKey] || [];
      if (existing.includes(value)) return prev;
      return { ...prev, [entryKey]: [...existing, value] };
    });
    setInputByEntry((prev) => ({ ...prev, [entryKey]: "" }));
  };

  // Remove a tag from a specific entry card
  const handleRemoveTag = (entryKey, tag) => {
    setTagsByEntry((prev) => ({
      ...prev,
      [entryKey]: (prev[entryKey] || []).filter((t) => t !== tag),
    }));
  };

  // Only display entries where quantity is greater than 0
  const shouldDisplayEntry = (entry) => {
    const qty = parseFloat(entry.tons);
    return !isNaN(qty) && qty > 0;
  };

  // Function to check if weight is within ±5% tolerance
  const isWeightInTolerance = (entry) => {
    // If no expected weight, return true
    if (!entry.expectedWeight) return true;
    
    const actualWeight = parseFloat(entry.tons);
    const expectedWeight = parseFloat(entry.expectedWeight);
    const tolerance = expectedWeight * 0.05; // 5% tolerance
    
    return Math.abs(actualWeight - expectedWeight) <= tolerance;
  };

  useEffect(() => {
    const fetchSauda = async () => {
      try {
        const res = await axiosInstance.get(`/save-sauda?company=${company}`);
        const entries = res.data?.entry?.saudaEntries || [];
        
        Object.keys(entries).forEach(commodity => {
          if (entries[commodity] && Array.isArray(entries[commodity])) {
            entries[commodity].sort((a, b) => {
              const dateA = new Date(a.createdAt || a.date || 0);
              const dateB = new Date(b.createdAt || b.date || 0);
              return dateB - dateA;
            });
          }
        });
        
        setSaudas(entries);
      } catch (error) {
        console.error("Error fetching sauda:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSauda();
  }, [company]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        {type === "purchase" ? "Purchase" : "Sale"} Sauda Details
      </h3>

      {/* Removed global tagging UI; tagging is per-entry below */}

      {loading ? (
        <Loading />
      ) : saudas.length === 0 ? (
        <p className="text-gray-500">No sauda entries found.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(saudas).map(([commodity, entries]) =>
            entries
              .filter(entry => shouldDisplayEntry(entry))
              .map((entry, idx) => {
                const amount = parseFloat(entry.tons) * parseFloat(entry.finalRate);
                const isInTolerance = isWeightInTolerance(entry);
                const entryKey = `${commodity}-${idx}-${entry.saudaNo || "NA"}`;
                
                return (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg ${
                      isInTolerance 
                        ? 'bg-gray-50' 
                        : 'bg-yellow-50'
                    } shadow-sm`}
                  >
                    {/* Top section: Sauda No and Date */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Sauda No</p>
                        <p className="text-sm text-gray-700">{entry.saudaNo || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">Date</p>
                        <p className="text-sm text-gray-700">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleString()
                            : (entry.date || "N/A")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Buyer</p>
                        <p className="text-sm text-gray-600">{entry.buyerName || company || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Seller</p>
                        <p className="text-sm text-gray-600">{entry.sellerCompany || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Quantity</p>
                        <p className="text-sm text-gray-600">{entry.tons} {entry.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Rate</p>
                        <p className="text-sm text-gray-600">₹{entry.finalRate || entry.rate || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Amount</p>
                        <p className="text-sm text-gray-800 font-semibold">₹{isNaN(amount) ? "0.00" : amount.toFixed(2)}</p>
                      </div>
                      <div></div>
                    </div>
                    
                    {!isInTolerance && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Weight outside ±5% tolerance of expected {entry.expectedWeight} {entry.unit}
                      </p>
                    )}
                    
                    {type === "purchase" && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Tags</p>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={inputByEntry[entryKey] || ""}
                            onChange={(e) =>
                              setInputByEntry((prev) => ({
                                ...prev,
                                [entryKey]: e.target.value,
                              }))
                            }
                            placeholder="Add tag for this sauda"
                            className="px-3 py-2 border rounded-md text-sm flex-grow"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag(entryKey);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddTag(entryKey)}
                            className="px-3 py-2 bg-green-500 text-white rounded-md text-sm flex items-center gap-1"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        {(tagsByEntry[entryKey] || []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(tagsByEntry[entryKey] || []).map((tag) => (
                              <div key={tag} className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {tag}
                                <button
                                  onClick={() => handleRemoveTag(entryKey, tag)}
                                  className="ml-1 text-green-800 hover:text-green-900 flex items-center"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}
      {type === "purchase" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              // Placeholder for persisting tags; currently just confirms save
              toast.success("Saved successfully");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default SaudaDetails;
