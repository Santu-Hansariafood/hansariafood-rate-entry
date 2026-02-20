import React from "react";
import { Truck, Download } from "lucide-react";

const FreightHeader = ({ onDownloadExcel }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Freight Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set and track freight rates by route to power accurate landing cost.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDownloadExcel}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/40"
      >
        <Download className="w-4 h-4" />
        Download Excel
      </button>
    </div>
  );
};

export default FreightHeader;
