"use client";
import React, { Suspense } from "react";
import { format } from "date-fns";
import { exportWeeklyRateToExcel } from "@/utils/exportToExcel/exportToExcel";
import dynamic from "next/dynamic";
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
    <Suspense fallback={<Loading/>}>
      <button
        onClick={() =>
          exportWeeklyRateToExcel(groupedCompanies, weekDates, userName)
        }
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Download Excel
      </button>

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
    </Suspense>
  );
}
