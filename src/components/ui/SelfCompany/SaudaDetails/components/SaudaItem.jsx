import React from "react";

const SaudaItem = ({ sauda, colorClass, prefix }) => {
  const totalPrice = (Number(sauda.finalRate) || 0) * (Number(sauda.tons) || 0);

  return (
    <div className="text-[11px] flex items-center justify-between">
      <div className="truncate">
        <span className={`${colorClass} font-semibold`}>
          #{sauda.saudaNo || "-"}
        </span>{" "}
        • {sauda.sellerName || "-"}
        {sauda.sellerCompany ? ` (${sauda.sellerCompany})` : ""}
      </div>
      <div className="text-right min-w-[160px]">
        <span className="mr-2">{sauda.tons}Tons</span>
        <span className={`font-semibold ${colorClass}`}>
          {sauda.finalRate}
        </span>
        <span className="text-gray-500 ml-1">
          {sauda.unit}
        </span>
        <div className={`text-[10px] ${colorClass}`}>
          {prefix} {totalPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SaudaItem;
