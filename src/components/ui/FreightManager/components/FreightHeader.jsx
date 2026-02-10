import React from "react";
import { Truck } from "lucide-react";

const FreightHeader = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
        <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Freight Management
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage freight rates for different commodities
        </p>
      </div>
    </div>
  );
};

export default FreightHeader;
