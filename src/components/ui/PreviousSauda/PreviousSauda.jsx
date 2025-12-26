"use client";

import React, { Suspense, useMemo } from "react";
import usePreviousSauda from "@/hooks/PreviousSauda/PreviousSauda";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { downloadSaudaExcel } from "@/utils/exportToExcel/previousSauda/exportToExcel";

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
    setStatuses,
    fetchStatuses,
  } = usePreviousSauda();

  const handleMarkDone = async (item) => {
    try {
      setStatuses((prev) => ({
        ...prev,
        [item.saudaNo]: "Done",
      }));

      toast.success(`Sauda ${item.saudaNo} marked as Done`);

      await axiosInstance.post("/sauda-status", {
        saudaNo: item.saudaNo,
        status: "Done",
        unit: item.unit,
        commodity: item.commodity,
        sellerName: item.sellerName,
        sellerCompany: item.sellerCompany,
      });

      fetchStatuses();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const dataWithStatus = useMemo(() => {
    return entries.map((item) => {
      const currentStatus = statuses[item.saudaNo] || "Pending";
      const isDone = currentStatus === "Done";

      return {
        ...item,
        consigneeName: item.consignee?.split("-")[0] || "",
        statusText: currentStatus,

        status: (
          <button
            onClick={() => handleMarkDone(item)}
            disabled={isDone}
            className={`px-3 py-1 rounded text-white font-medium ${
              isDone
                ? "bg-green-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isDone ? "Done" : "Pending"}
          </button>
        ),
      };
    });
  }, [entries, statuses]);

  const columns = [
    { header: "S.No", accessor: "sl" },
    { header: "Buyer Name", accessor: "buyerName" },
    { header: "Buyer Company", accessor: "buyerCompany" },
    { header: "Consignee", accessor: "consigneeName" },
    { header: "Sauda No", accessor: "saudaNo" },
    { header: "Commodity", accessor: "commodity" },
    { header: "Delivery Date", accessor: "deliveryDate" },
    { header: "Seller Name", accessor: "sellerName" },
    { header: "Seller Company", accessor: "sellerCompany" },
    { header: "Tons", accessor: "tons" },
    { header: "Final Rate", accessor: "finalRate" },
    { header: "Status", accessor: "status" },
    { header: "Others", accessor: "others" },
  ];

  const handleDownload = () => {
    if (!dataWithStatus.length) {
      toast.warning("No data to download");
      return;
    }
    downloadSaudaExcel(dataWithStatus, `Previous_Sauda_${date}.xlsx`);
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Title text="Previous Sauda Entries" />

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Download Excel
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <DateSelector value={date} onChange={setDate} />
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by Sauda No..."
          />
        </div>

        {loading && <Loading />}
        {!loading && <Table data={dataWithStatus} columns={columns} />}
      </div>
    </Suspense>
  );
};

export default PreviousSauda;
