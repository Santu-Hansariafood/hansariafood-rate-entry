import dynamic from "next/dynamic";
import React from "react";
const PurchaseHistory = dynamic(() => import("./PurchaseHistory"));
const SalesHistory = dynamic(() => import("./SalesHistory"));

const CombinedView = ({ units, filterUnitsBySeller }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PurchaseHistory units={units} />
      <SalesHistory units={units} filterUnitsBySeller={filterUnitsBySeller} />
    </div>
  );
};

export default CombinedView;
