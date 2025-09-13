import React from "react";
import SaudaItem from "./SaudaItem";

const SalesHistory = ({ units, filterUnitsBySeller }) => {
  const filteredUnits = filterUnitsBySeller(units);

  if (!filteredUnits.length) {
    return (
      <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
        <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
          Sales History
        </div>
        <div className="text-xs text-gray-500">No sales for any sellers on this date.</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900">
      <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
        Sales History
      </div>
      <div className="space-y-3">
        {filteredUnits.map((u, idx) => (
          <div key={`sell-${idx}`} className="mb-3 last:mb-0">
            <div className="text-xs font-medium mb-1">Consignee: {u.unit}</div>
            <div className="space-y-2">
              {u.commodities.map((co, cidx) => (
                <div key={`sell-${idx}-${cidx}`}>
                  <div className="text-xs font-medium">
                    {co.commodity}{" "}
                    <span className="text-[10px] text-gray-500">({co.totalTons} Tons)</span>
                  </div>
                  <div className="mt-1 border-t border-gray-100 dark:border-gray-700 pt-1 space-y-1">
                    {co.saudas.map((s, sidx) => (
                      <SaudaItem
                        key={`sell-${idx}-${cidx}-${sidx}`}
                        sauda={s}
                        colorClass="text-yellow-700 dark:text-yellow-300"
                        prefix="= ₹"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesHistory;
