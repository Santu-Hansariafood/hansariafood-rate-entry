"use client";

import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Star,
  AlertTriangle,
} from "lucide-react";

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

  const primeSellers = [];
  const attentionSellers = [];
  const otherSellers = [];

  sellers.forEach((seller) => {
    const name = seller.name || seller;
    const latest = seller.latestDate || null;
    const status = getSellerStatus(latest);
    const item = { name, latest, status };
    if (status === "active") primeSellers.push(item);
    else if (status === "inactive") attentionSellers.push(item);
    else otherSellers.push(item);
  });

  const SellerItem = ({ item }) => (
    <button
      key={item.name}
      onClick={() => onSellerClick(item.name)}
      className={`w-full flex items-center justify-between gap-3 text-left px-5 py-4 rounded-xl 
			shadow-md transition-all duration-300 
			${
        selectedSeller === item.name
          ? "bg-gradient-to-r from-green-500 to-yellow-400 text-white scale-[1.02]"
          : item.status === "active"
          ? "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-800/40 border-2 border-yellow-300 dark:border-yellow-500"
          : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-600"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {item.status === "active" && (
          <Star
            size={14}
            className="text-yellow-500 drop-shadow animate-bounce mt-[1px]"
          />
        )}
        <span
          className={`font-semibold text-base ${
            selectedSeller === item.name
              ? "text-white"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {item.name}
        </span>
      </span>
      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium">
        {item.status === "active" && (
          <ArrowUpCircle
            size={18}
            className="text-green-600 dark:text-green-300"
          />
        )}
        {item.status === "inactive" && (
          <ArrowDownCircle
            size={18}
            className="text-red-600 dark:text-red-400"
          />
        )}
        {item.status === "neutral" && (
          <MinusCircle
            size={18}
            className="text-yellow-500 dark:text-yellow-400"
          />
        )}
        {item.latest && (
          <span
            className={`ml-1 ${
              selectedSeller === item.name
                ? "text-white/90"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {item.latest}
          </span>
        )}
      </span>
    </button>
  );

  return (
    <div className="lg:col-span-1 w-full bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-900 dark:to-yellow-900 rounded-2xl shadow-xl border border-green-200 dark:border-green-700 p-6">
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

      <div className="mt-4 space-y-5 max-h-[400px] overflow-y-auto pr-1 scroll-smooth">
        {sellers.length === 0 ? (
          <div className="text-center py-10 text-green-700 dark:text-yellow-300 text-sm">
            {sellerSearch
              ? "No sellers found matching your search"
              : "No sellers available"}
          </div>
        ) : (
          <>
            {primeSellers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-500" size={18} />
                  <h3 className="text-sm font-semibold text-green-800 dark:text-yellow-200">
                    Prime Sellers
                  </h3>
                </div>
                <div className="space-y-3">
                  {primeSellers.map((item) => (
                    <SellerItem key={`prime-${item.name}`} item={item} />
                  ))}
                </div>
              </div>
            )}

            {otherSellers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-800 dark:text-yellow-200 mb-2">
                  All Sellers
                </h3>
                <div className="space-y-3">
                  {otherSellers.map((item) => (
                    <SellerItem key={`other-${item.name}`} item={item} />
                  ))}
                </div>
              </div>
            )}

            {attentionSellers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-500" size={18} />
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Attention Needed
                  </h3>
                </div>
                <div className="space-y-3">
                  {attentionSellers.map((item) => (
                    <SellerItem key={`attention-${item.name}`} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerList;
