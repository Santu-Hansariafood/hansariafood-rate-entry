"use client";

import React from "react";
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";

const SellerList = ({
  sellers,
  selectedSeller,
  sellerSearch,
  onSellerSearch,
  onSellerClick,
  searchCount,
  totalCount,
}) => {
  const getSellerStatus = (latestDate) => {
    if (!latestDate) return "neutral";

    const [dd, mm, yyyy] = latestDate.split("-");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const diffDays = Math.floor(
      (new Date().setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 7) return "active";
    if (diffDays > 15) return "inactive";
    return "neutral";
  };

  const displayCount = sellerSearch ? searchCount : totalCount;
  const showSearchInfo = sellerSearch && searchCount !== totalCount;

  return (
    <div className="lg:col-span-1 w-full bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-900 dark:to-yellow-900 rounded-2xl shadow-xl border border-green-200 dark:border-green-700 p-6">
      {/* Header + Search (sticky inside container) */}
      <div className="sticky top-0 bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-900 dark:to-yellow-900 z-10 pb-4">
        <div className="flex flex-col mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-green-800 dark:text-yellow-200">
            Sellers ({displayCount})
          </h2>
          {showSearchInfo && (
            <span className="text-sm text-green-700 dark:text-yellow-300">
              Showing {searchCount} of {totalCount}
            </span>
          )}
        </div>

        <input
          value={sellerSearch}
          onChange={(e) => onSellerSearch(e.target.value)}
          placeholder="🔍 Search seller..."
          className="w-full px-4 py-2.5 rounded-xl border border-green-300 dark:border-green-600 
          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
          placeholder-gray-500 dark:placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-yellow-500
          shadow-sm transition-all"
        />
      </div>

      {/* Scrollable Seller List (10 items height) */}
      <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-1 scroll-smooth">
        {sellers.length === 0 ? (
          <div className="text-center py-10 text-green-700 dark:text-yellow-300 text-sm">
            {sellerSearch
              ? "No sellers found matching your search"
              : "No sellers available"}
          </div>
        ) : (
          sellers.map((seller) => {
            const name = seller.name || seller;
            const latest = seller.latestDate || null;
            const status = getSellerStatus(latest);

            return (
              <button
                key={name}
                onClick={() => onSellerClick(name)}
                className={`w-full flex items-center justify-between gap-3 text-left px-5 py-4 rounded-xl 
                shadow-md transition-all duration-300 
                ${
                  selectedSeller === name
                    ? "bg-gradient-to-r from-green-500 to-yellow-400 text-white scale-[1.02]"
                    : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-600"
                }`}
              >
                {/* Seller Name */}
                <span
                  className={`font-semibold text-base ${
                    selectedSeller === name
                      ? "text-white"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {name}
                </span>

                {/* Status */}
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium">
                  {status === "active" && (
                    <ArrowUpCircle
                      size={18}
                      className="text-green-600 dark:text-green-300"
                    />
                  )}
                  {status === "inactive" && (
                    <ArrowDownCircle
                      size={18}
                      className="text-red-600 dark:text-red-400"
                    />
                  )}
                  {status === "neutral" && (
                    <MinusCircle
                      size={18}
                      className="text-yellow-500 dark:text-yellow-400"
                    />
                  )}
                  {latest && (
                    <span
                      className={`ml-1 ${
                        selectedSeller === name
                          ? "text-white/90"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {latest}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SellerList;
