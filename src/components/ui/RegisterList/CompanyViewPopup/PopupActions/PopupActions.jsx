"use client";
import React, { Suspense } from "react";
import { CalendarDays, Download } from "lucide-react";
import { format } from "date-fns";
import Loading from "@/components/common/Loading/Loading";

export default function PopupActions({ weekDates, downloading, onDownload }) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex justify-between items-center mt-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Week: {format(weekDates[0], "dd MMM yyyy")} -{" "}
            {format(weekDates[6], "dd MMM yyyy")}
          </span>
        </div>
        <button
          onClick={onDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md 
                     hover:bg-green-700 disabled:opacity-50 
                     dark:bg-green-700 dark:hover:bg-green-800"
        >
          <Download size={16} />
          {downloading ? "Generating..." : "Download"}
        </button>
      </div>
    </Suspense>
  );
}
