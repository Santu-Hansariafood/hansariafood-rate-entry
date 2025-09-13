import React from "react";
import SaudaItem from "./SaudaItem";

const PurchaseHistory = ({ units }) => {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
      <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
        Purchase History
      </div>
      {units.map((u, idx) => (
        <div key={`buy-${idx}`} className="mb-3 last:mb-0">
          <div className="text-xs font-medium mb-1">Consignee: {u.unit}</div>
          <div className="space-y-2">
            {u.commodities.map((co, cidx) => (
              <div key={`buy-${idx}-${cidx}`}>
                <div className="text-xs font-medium">
                  {co.commodity}{" "}
                  <span className="text-[10px] text-gray-500">
                    ({co.totalTons} Tons)
                  </span>
                </div>
                <div className="mt-1 border-t border-gray-100 dark:border-gray-700 pt-1 space-y-1">
                  {co.saudas.map((s, sidx) => (
                    <SaudaItem
                      key={`buy-${idx}-${cidx}-${sidx}`}
                      sauda={s}
                      colorClass="text-green-700 dark:text-green-300"
                      prefix="="
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PurchaseHistory;
