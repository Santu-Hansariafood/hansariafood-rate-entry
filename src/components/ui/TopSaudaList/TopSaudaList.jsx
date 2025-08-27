"use client";

import React, { useState, useEffect, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import Title from "@/components/common/Title/Title";
import { XCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

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
        const sellersResp = Array.isArray(res.data.sellers)
          ? res.data.sellers
          : [];
        const normalized = sellersResp.map((s) =>
          typeof s === "string" ? { name: s, latestDate: null } : s
        );
        setSellers(normalized);
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
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Title text="Seller Dashboard" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Seller List */}
            <div className="lg:col-span-1 bg-gradient-to-b from-pink-50 to-rose-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Sellers List ({sellers.length})
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {sellers.map((seller) => {
                  const name = seller.name || seller;
                  const latest = seller.latestDate || null;
                  let status = "neutral";
                  if (latest) {
                    const [dd, mm, yyyy] = latest.split("-");
                    const d = new Date(
                      Number(yyyy),
                      Number(mm) - 1,
                      Number(dd)
                    );
                    const diffDays = Math.floor(
                      (new Date().setHours(0, 0, 0, 0) -
                        d.setHours(0, 0, 0, 0)) /
                        (1000 * 60 * 60 * 24)
                    );
                    if (diffDays <= 7) status = "active";
                    else if (diffDays > 15) status = "inactive";
                    else status = "neutral";
                  }

                  return (
                    <button
                      key={name}
                      onClick={() => handleSellerClick(name)}
                      className={`w-full flex items-center justify-between gap-3 text-left p-3 rounded-lg transition-all duration-200 
                        ${
                          selectedSeller === name
                            ? "bg-gradient-to-r from-indigo-200 to-blue-200 dark:from-indigo-800 dark:to-blue-800 border border-indigo-400"
                            : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {name}
                      </span>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs">
                        {status === "active" && (
                          <ArrowUpCircle
                            size={16}
                            className="text-green-600 dark:text-green-400"
                          />
                        )}
                        {status === "inactive" && (
                          <ArrowDownCircle
                            size={16}
                            className="text-red-600 dark:text-red-400"
                          />
                        )}
                        {latest && (
                          <span className="text-gray-700 dark:text-gray-400">
                            {latest}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seller Details */}
            <div className="lg:col-span-3">
              {selectedSeller ? (
                <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                      {selectedSeller} - Sauda Details
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedSeller(null);
                        setSaudaDetails(null);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-lg transition-colors"
                    >
                      <XCircle size={18} title="Clear selection" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loading />
                    </div>
                  ) : saudaDetails?.length ? (
                    <div className="space-y-6">
                      {saudaDetails.map((company) => (
                        <div
                          key={company.company}
                          className="border border-blue-200 dark:border-blue-600 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-300">
                              {company.company}
                            </h3>
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                              Total: {company.companyTotalTons?.toFixed(2) || 0}{" "}
                              Tons
                            </span>
                          </div>

                          <div className="space-y-4">
                            {[...company.days]
                              .sort((a, b) => {
                                const [da, ma, ya] = (a.date || "").split("-");
                                const [db, mb, yb] = (b.date || "").split("-");
                                const ta = new Date(
                                  Number(ya),
                                  Number(ma) - 1,
                                  Number(da)
                                ).getTime();
                                const tb = new Date(
                                  Number(yb),
                                  Number(mb) - 1,
                                  Number(db)
                                ).getTime();
                                return tb - ta;
                              })
                              .map((day, i) => (
                                <div
                                  key={`${day.date}-${i}`}
                                  className="rounded-lg p-4 border border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800"
                                >
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-amber-800 dark:text-yellow-300">
                                      📅 {day.date}
                                    </h4>
                                    <span className="text-sm text-amber-700 dark:text-yellow-200">
                                      Day Total:{" "}
                                      {day.dayTotalTons?.toFixed(2) || 0} Tons
                                    </span>
                                  </div>

                                  <div className="space-y-4">
                                    {day.units.map((unitObj, uIdx) => (
                                      <div
                                        key={`${unitObj.unit}-${uIdx}`}
                                        className="rounded-lg p-3 border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-800 dark:to-indigo-900"
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <h5 className="font-semibold text-purple-900 dark:text-purple-200">
                                            🏷️ {unitObj.unit}
                                          </h5>
                                          <span className="text-xs text-purple-700 dark:text-purple-300">
                                            Unit Total:{" "}
                                            {unitObj.unitTotalTons?.toFixed(
                                              2
                                            ) || 0}{" "}
                                            Tons
                                          </span>
                                        </div>

                                        <div className="space-y-3">
                                          {unitObj.commodities.map((com, j) => (
                                            <div
                                              key={j}
                                              className="rounded-lg p-3 border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900"
                                            >
                                              <h6 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                                                🧺 {com.commodity} (
                                                {com.totalTons?.toFixed(2) || 0}{" "}
                                                tons)
                                              </h6>

                                              <div className="space-y-2">
                                                {com.saudas.map((s, k) => (
                                                  <div
                                                    key={k}
                                                    className={`flex items-center justify-between text-sm px-3 py-2 rounded 
                                                      ${
                                                        k % 2 === 0
                                                          ? "bg-white dark:bg-gray-600"
                                                          : "bg-gray-100 dark:bg-gray-500"
                                                      }`}
                                                  >
                                                    <span className="text-gray-800 dark:text-gray-200">
                                                      Sauda #{s.saudaNo || "—"}
                                                    </span>
                                                    <span className="text-gray-700 dark:text-gray-100">
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
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
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

          {/* Pagination */}
          {selectedSeller && (
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                disabled={currentPage <= 1 || loading}
                onClick={() => loadPage(Math.max(1, currentPage - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage}
              </span>
              <button
                disabled={loading}
                onClick={() => loadPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default TopSaudaList;
