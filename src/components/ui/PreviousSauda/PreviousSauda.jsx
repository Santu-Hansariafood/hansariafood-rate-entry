"use client";

import React, { Suspense, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import usePreviousSauda from "@/hooks/PreviousSauda/PreviousSauda";
import Loading from "@/components/common/Loading/Loading";
import { downloadSaudaExcel } from "@/utils/exportToExcel/previousSauda/exportToExcel";
import { downloadSaudaPDF } from "@/utils/previousSauda/exportToPdf";
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

  const formatSaudaNo = (value) =>
    value ? value.toString().slice(-4) : "";

  const handleMarkDone = useCallback(
    async (item) => {
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
      } catch (error) {
        toast.error("Failed to update status");
        console.error(error);
      }
    },
    [fetchStatuses, setStatuses]
  );

  const dataWithStatus = useMemo(() => {
    return entries.map((item, index) => {
      const currentStatus = statuses[item.saudaNo] || "Pending";
      const isDone = currentStatus === "Done";

      return {
        ...item,
        saudaNo: formatSaudaNo(item.saudaNo),
        sl: index + 1,
        consigneeName: item.consignee?.split("-")[0] || "",
        statusText: currentStatus,
        status: (
          <button
            onClick={() => handleMarkDone(item)}
            disabled={isDone}
            className={`min-w-[80px] px-3 py-1 rounded-full text-xs font-semibold transition
              ${
                isDone
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
          >
            {isDone ? "Done" : "Pending"}
          </button>
        ),
      };
    });
  }, [entries, statuses, handleMarkDone]);

  const columns = useMemo(
    () => [
      { header: "S.No", accessor: "sl" },
      // { header: "Buyer Name", accessor: "buyerName" },
      { header: "Buyer Company", accessor: "buyerCompany" },
      { header: "Consignee", accessor: "consigneeName" },
      { header: "Sauda No", accessor: "saudaNo" },
      { header: "Commodity", accessor: "commodity" },
      { header: "Delivery Date", accessor: "deliveryDate" },
      // { header: "Seller Name", accessor: "sellerName" },
      { header: "Seller Company", accessor: "sellerCompany" },
      { header: "Tons", accessor: "tons" },
      { header: "Final Rate", accessor: "finalRate" },
      { header: "Status", accessor: "status" },
      { header: "Others", accessor: "others" },
    ],
    []
  );

  const handleDownloadExcel = useCallback(() => {
    if (!dataWithStatus.length) {
      toast.warning("No data to download");
      return;
    }
    downloadSaudaExcel(dataWithStatus, `Previous_Sauda_${date}.xlsx`);
  }, [dataWithStatus, date]);

  const handleDownloadPDF = useCallback(() => {
    if (!dataWithStatus.length) {
      toast.warning("No data to download");
      return;
    }
    downloadSaudaPDF(dataWithStatus, `Previous_Sauda_${date}.pdf`);
  }, [dataWithStatus, date]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-6 space-y-5 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Title text="Previous Sauda Entries" />
          <div className="flex gap-2">
            <button
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              Download Excel
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              Download PDF
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          <DateSelector value={date} onChange={setDate} />
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by Sauda No..."
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <Loading />
          ) : (
            <Table data={dataWithStatus} columns={columns} />
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default PreviousSauda;
