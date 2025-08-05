"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import Loading from "@/components/common/Loading/Loading";
const CompanyRateTable = dynamic(() =>
  import("../CompanyRateTable/CompanyRateTable")
);

export default function DownloadableContent({
  refObj,
  weekDates,
  groupedCompanies,
  userName,
}) {
  return (
    <Suspense fallback={<Loading />}>
      <div
        ref={refObj}
        className="overflow-x-auto border rounded-md p-4 bg-white text-black text-xs"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">
          Weekly Rate Sheet for {userName || "User"}
        </h2>
        <p className="mb-4 text-sm text-center text-gray-600">
          Week: {format(weekDates[0], "dd MMM yyyy")} -{" "}
          {format(weekDates[6], "dd MMM yyyy")}
        </p>

        {groupedCompanies.map((company, idx) => (
          <div key={idx} className="mb-6 break-inside-avoid">
            <CompanyRateTable company={company} weekDates={weekDates} />
          </div>
        ))}
      </div>
    </Suspense>
  );
}
