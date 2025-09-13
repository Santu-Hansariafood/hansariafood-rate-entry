import React from "react";
import PurchaseHistory from "./PurchaseHistory";
import SalesHistory from "./SalesHistory";
import CombinedView from "./CombinedView";

const SaudaDayCard = ({ day, viewMode, filterUnitsBySeller }) => {
  const renderViewContent = () => {
    switch (viewMode) {
      case "purchase":
        return <PurchaseHistory units={day.units} />;
      case "sales":
        return <SalesHistory units={day.units} filterUnitsBySeller={filterUnitsBySeller} />;
      case "combined":
        return <CombinedView units={day.units} filterUnitsBySeller={filterUnitsBySeller} />;
      default:
        return <PurchaseHistory units={day.units} />;
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{day.date}</h3>
        <span className="text-xs text-gray-500">
          Total Tons: {day.dayTotalTons}
        </span>
      </div>
      <div className="mt-3 space-y-4">
        {renderViewContent()}
      </div>
    </div>
  );
};

export default SaudaDayCard;
