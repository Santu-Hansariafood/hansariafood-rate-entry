import React from "react";
import { COMMODITIES } from "@/hooks/useFreightManager";

const CommodityTabs = ({ selectedCommodity, setSelectedCommodity, setPagination }) => {
  return (
    <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-xl">
      {COMMODITIES.map((comm) => (
        <button
          key={comm}
          onClick={() => {
            setSelectedCommodity(comm);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            selectedCommodity === comm
              ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {comm}
        </button>
      ))}
    </div>
  );
};

export default CommodityTabs;
