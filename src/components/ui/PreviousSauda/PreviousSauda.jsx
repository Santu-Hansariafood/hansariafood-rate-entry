"use client";

import React, { Suspense, useMemo } from "react";
import usePreviousSauda from "@/hooks/PreviousSauda/PreviousSauda";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

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

const PreviousSauda = () => {
  const {
    date,
    setDate,
    entries = [],
    loading,
    search,
    setSearch,
    statuses,
    fetchStatuses,
  } = usePreviousSauda();

  const handleMarkDone = async (item) => {
    try {
      await axiosInstance.post("/sauda-status", {
        saudaNo: item.saudaNo,
        status: "Done",
        unit: item.unit,
        commodity: item.commodity,
        sellerName: item.sellerName,
        sellerCompany: item.sellerCompany,
      });
      fetchStatuses();
      toast.success(`Sauda ${item.saudaNo} marked as Done`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const dataWithStatus = useMemo(
    () =>
      entries.map((item, idx) => {
        const currentStatus = statuses[item.saudaNo] || "Pending";
        const isDone = currentStatus === "Done";
        return {
          ...item,
          status: (
            <button
              onClick={() => handleMarkDone(item)}
              disabled={isDone}
              className={`px-3 py-1 rounded text-white font-medium transition-all ${
                isDone
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isDone ? "Done" : "Pending"}
            </button>
          ),
        };
      }),
    [entries, statuses]
  );

  const columns = [
    { header: "S.No", accessor: "sl" },
    { header: "Unit", accessor: "unit" },
    { header: "Sauda No", accessor: "saudaNo" },
    { header: "Commodity", accessor: "commodity" },
    { header: "Seller", accessor: "sellerName" },
    { header: "Company", accessor: "sellerCompany" },
    { header: "Tons", accessor: "tons" },
    { header: "Final Rate", accessor: "finalRate" },
    { header: "Others", accessor: "others" },
    { header: "Status", accessor: "status" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-4">
        <Title text="Previous Sauda Entries" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 lg:w-1/3">
            <DateSelector value={date} onChange={setDate} />
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/3">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search by Sauda No..."
            />
          </div>
        </div>

        {loading && <Loading />}
        {!loading && <Table data={dataWithStatus} columns={columns} />}
      </div>
    </Suspense>
  );
};

export default PreviousSauda;
