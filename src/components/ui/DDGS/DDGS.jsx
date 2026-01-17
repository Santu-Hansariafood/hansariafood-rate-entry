"use client";

import React, { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useDDGSRates from "@/hooks/DDGS/useDDGSRates";
import { exportToExcel, exportToPDF } from "@/utils/ddgs/exportDDGS";

const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  ssr: false,
});
const SearchBox = dynamic(() =>
  import("@/components/common/SearchBox/SearchBox")
);
const DateSelector = dynamic(() =>
  import("@/components/common/DateSelector/DateSelector")
);
const Title = dynamic(() => import("@/components/common/Title/Title"));

const todayISO = new Date().toISOString().split("T")[0];

export default function DDGS() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayISO);

  const { rows, loading, commodities } = useDDGSRates(date, search);

  const tableData = useMemo(
    () =>
      rows.map((row, index) => ({
        sl: index + 1,
        ...row,
      })),
    [rows]
  );

  const columns = useMemo(
    () => [
      { header: "S.No", accessor: "sl" },
      { header: "Company", accessor: "company" },
      { header: "Location", accessor: "location" },
      ...commodities.map((c) => ({
        header: c,
        accessor: c,
      })),
    ],
    [commodities]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-6 space-y-5 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Title text="DDGS Rate" />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => exportToExcel(tableData, columns)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              Export Excel
            </button>

            <button
              onClick={() => exportToPDF(tableData, columns, date)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          <DateSelector value={date} onChange={setDate} label="Rate Date" />

          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search Company or Location..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? <Loading /> : <Table data={tableData} columns={columns} />}
        </div>
      </div>
    </Suspense>
  );
}

