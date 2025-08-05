"use client";
import React, { Suspense } from "react";
import { format } from "date-fns";
import Loading from "@/components/common/Loading/Loading";

export default function CompanyRateTable({ company, weekDates }) {
  if (!company.locations.length) {
    return (
      <div className="text-right text-sm font-medium text-blue-700 mb-1">
        {company.name}
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="text-right text-sm font-semibold text-green-700 mb-2">
        {company.name}
      </div>
      <table className="min-w-full table-auto border-collapse text-[10px]">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="border px-2 py-1 text-left">Location</th>
            {weekDates.map((date, i) => (
              <th key={i} className="border px-2 py-1 text-center">
                {format(date, "EEE dd")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {company.locations.map((location, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1 text-yellow-800 font-medium bg-yellow-50">
                {location}
              </td>
              {weekDates.map((_, i) => (
                <td key={i} className="border px-2 py-1 text-center">
                  <div className="w-5 h-5 border border-dashed rounded mx-auto" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Suspense>
  );
}
