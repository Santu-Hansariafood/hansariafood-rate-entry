"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Purchase from "./Purchase/Purchase";

const SelfCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // filters
  const [mode, setMode] = useState("combined"); // purchase | sell | combined
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchSelfCompanies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/managecompany?self=true&limit=50");
      setCompanies(res.data?.companies || []);
    } catch (error) {
      console.error("Error fetching self companies:", error);
      toast.error(error.response?.data?.error || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setMode("combined");
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    fetchSelfCompanies();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Self Companies</h2>

      {loading ? (
        <p>Loading...</p>
      ) : companies.length === 0 ? (
        <p>No self companies found.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {companies.map((company) => (
            <button
              key={company._id}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
              onClick={() => setSelectedCompany(company)}
            >
              {company.name}
            </button>
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-5xl h-[85%] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header (Fixed) */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="text-lg font-semibold">
                Sauda History - {selectedCompany.name}
              </h3>
              <button
                onClick={() => setSelectedCompany(null)}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {/* Combined Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow">
                {/* Mode Selector */}
                <div className="flex gap-2 flex-wrap">
                  {["purchase", "sell", "combined"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setMode(opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        mode === opt
                          ? "bg-blue-500 text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Date Range + Clear */}
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Sauda History Data Placeholder */}
              {mode === "purchase" && (
  <Purchase company={selectedCompany?.name} />
)}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfCompany;
