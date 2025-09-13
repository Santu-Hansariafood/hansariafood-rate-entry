"use client";

import React, { useState } from "react";
import Loading from "@/components/common/Loading/Loading";
import { useSaudaData } from "@/hooks/SaudaDetails/useSaudaData";
import { useDateFiltering } from "@/hooks/SaudaDetails/useDateFiltering";
import { useSellerFiltering } from "@/hooks/SaudaDetails/useSellerFiltering";
import dynamic from "next/dynamic";
const DateFilterControls = dynamic(() => import("./components/DateFilterControls"));
const ViewModeButtons = dynamic(() => import("./components/ViewModeButtons"));
const SaudaDayCard = dynamic(() => import("./components/SaudaDayCard"));

const SaudaDetails = ({ companyName }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("purchase");
  const { loading, error, data, sellerInfo } = useSaudaData(companyName);
  const { orderedDays } = useDateFiltering(data, startDate, endDate);
  const { filterUnitsBySeller } = useSellerFiltering(sellerInfo);

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) return <Loading />;
  if (error) return <div className="py-6 text-sm text-red-500">{error}</div>;
  if (!orderedDays.length)
    return (
      <div className="py-6 text-sm text-gray-500 dark:text-gray-400">
        No sauda found for this company.
      </div>
    );

  return (
    <div className="space-y-4 max-h-[72vh] overflow-auto pr-1">
      <div className="flex flex-wrap items-end gap-3 sticky top-0 bg-gray-50 dark:bg-gray-800/50 py-2 z-10">
        <DateFilterControls
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={handleClearDates}
        />
        <ViewModeButtons viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      {orderedDays.map((day) => (
        <SaudaDayCard
          key={day.date}
          day={day}
          viewMode={viewMode}
          filterUnitsBySeller={filterUnitsBySeller}
        />
      ))}
    </div>
  );
};

export default SaudaDetails;
