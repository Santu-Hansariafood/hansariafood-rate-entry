"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const TopSaudaList = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [saudaDetails, setSaudaDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axiosInstance.get("/save-sauda/sauda-descriptions");
        setSellers(res.data.sellers || []);
      } catch (err) {
        console.error("Error fetching sellers:", err);
      }
    };
    fetchSellers();
  }, []);

  const handleSellerClick = async (sellerName) => {
    try {
      setLoading(true);
      setSelectedSeller(sellerName);
      setCurrentPage(1);

      const url = `/save-sauda/sauda-descriptions?sellerName=${encodeURIComponent(
        sellerName
      )}&page=1`;

      const res = await axiosInstance.get(url);
      setSaudaDetails(res.data.data || []);
    } catch (err) {
      console.error("Error fetching sauda details:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (page) => {
    try {
      setLoading(true);
      const url = `/save-sauda/sauda-descriptions?sellerName=${encodeURIComponent(
        selectedSeller
      )}&page=${page}`;

      const res = await axiosInstance.get(url);
      setSaudaDetails(res.data.data || []);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error loading page:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Seller Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Sellers */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Sellers ({sellers.length})
            </h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {sellers.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSellerClick(item)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    selectedSeller === item
                      ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-600"
                      : "hover:border-blue-200 dark:hover:border-blue-700"
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedSeller ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedSeller} - Sauda Details
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedSeller(null);
                      setSaudaDetails(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : saudaDetails?.length ? (
                  <div className="space-y-6">
                    {saudaDetails.map((company) => (
                      <div
                        key={company.company}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {company.company}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            Total: {company.companyTotalTons?.toFixed(2) || 0}{" "}
                            Tons
                          </span>
                        </div>

                        <div className="space-y-4">
                          {company.days.map((day, i) => (
                            <div
                              key={`${day.date}-${i}`}
                              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  📅 {day.date}
                                </h4>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Day Total: {day.dayTotalTons?.toFixed(2) || 0}{" "}
                                  Tons
                                </span>
                              </div>

                              <div className="space-y-4">
                                {day.units.map((unitObj, uIdx) => (
                                  <div
                                    key={`${unitObj.unit}-${uIdx}`}
                                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                        🏷️ {unitObj.unit}
                                      </h5>
                                      <span className="text-xs text-gray-600 dark:text-gray-300">
                                        Unit Total:{" "}
                                        {unitObj.unitTotalTons?.toFixed(2) || 0}{" "}
                                        Tons
                                      </span>
                                    </div>
                                    <div className="space-y-3">
                                      {unitObj.commodities.map((com, j) => (
                                        <div
                                          key={j}
                                          className="bg-white dark:bg-gray-600 rounded-lg p-3"
                                        >
                                          <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            🧺 {com.commodity} (
                                            {com.totalTons?.toFixed(2) || 0}{" "}
                                            tons)
                                          </h6>
                                          <div className="space-y-2">
                                            {com.saudas.map((s, k) => (
                                              <div
                                                key={k}
                                                className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-500 rounded px-3 py-2"
                                              >
                                                <span className="text-gray-700 dark:text-gray-200">
                                                  Sauda #{s.saudaNo || "—"}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-100">
                                                  {s.tons} {s.unit} @ ₹
                                                  {s.finalRate}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      No sauda entries found for {selectedSeller}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Seller
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a seller from the left sidebar to view their sauda
                  details.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedSeller && (
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => loadPage(Math.max(1, currentPage - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage}
            </span>
            <button
              disabled={loading}
              onClick={() => loadPage(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSaudaList;
