"use client";

import { FileDown } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import useSaudaNotifications from "@/hooks/SaudaData/useSaudaNotifications";

const DownloadExcelButton = () => {
  const { filteredNotifications } = useSaudaNotifications();

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sauda Notifications");

    sheet.columns = [
      { header: "Buyer", key: "buyer", width: 25 },
      { header: "Date", key: "date", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "Commodity", key: "commodity", width: 20 },
      { header: "Tons", key: "tons", width: 10 },
      { header: "Rate", key: "rate", width: 15 },
      { header: "Seller", key: "seller", width: 25 },
      { header: "Sauda No", key: "saudaNo", width: 15 },
      { header: "Notes", key: "others", width: 15 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
        size: 12,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    filteredNotifications.forEach((item, index) => {
      const row = sheet.addRow({
        buyer: item.company,
        date: item.date,
        location: item.location,
        commodity: item.commodity,
        tons: item.tons,
        rate: item.rate ?? "N/A",
        seller: item.description ?? "",
        saudaNo: item.saudaNo ?? "",
        others: item.others ?? "",
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          };
        });
      }
    });

    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `sauda_notifications_${new Date().toISOString()}.xlsx`);
    toast.success("📁 Excel downloaded with Buyer/Seller mapping!");
  };

  return (
    <button
      onClick={handleDownloadExcel}
      title="Download Excel"
      className="text-white hover:text-gray-200"
    >
      <FileDown className="w-5 h-5" />
    </button>
  );
};

export default DownloadExcelButton;
