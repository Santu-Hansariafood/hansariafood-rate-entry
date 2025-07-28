"use client";

import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import useRateEntries from "@/hooks/RateEntries/useRateEntries";

const DownloadRateEntriesExcel = () => {
  const { groupedRates, mobileToName } = useRateEntries();

  const handleDownloadExcel = async () => {
    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const filename = `RateEntries_${today.getDate()}_${today.toLocaleString(
        "default",
        {
          month: "long",
        }
      )}_${today.getFullYear()}.xlsx`;

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Rate Entries");

      const title = `📊 Today Rate Entries by User - ${formattedDate}`;
      sheet.mergeCells("A1:E1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = title;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E0F2FE" },
      };
      sheet.getRow(1).height = 30;

      const headers = [
        "Submitted By",
        "Company",
        "Location",
        "Rate (₹)",
        "Updated Time",
      ];
      sheet.getRow(2).values = headers;
      const headerRow = sheet.getRow(2);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "6366F1" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 22;

      sheet.columns = [
        { key: "user", width: 25 },
        { key: "company", width: 25 },
        { key: "location", width: 20 },
        { key: "rate", width: 15 },
        { key: "time", width: 25 },
      ];

      sheet.views = [{ state: "frozen", ySplit: 2 }];

      Object.entries(groupedRates).forEach(([mobile, entries]) => {
        const userName = mobileToName[mobile] || mobile;

        entries.forEach((entry) => {
          const row = sheet.addRow({
            user: userName,
            company: entry.company,
            location: entry.location,
            rate: entry.newRate,
            time: new Date(entry.lastUpdated).toLocaleString("en-GB"),
          });

          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin", color: { argb: "CCCCCC" } },
              bottom: { style: "thin", color: { argb: "CCCCCC" } },
              left: { style: "thin", color: { argb: "CCCCCC" } },
              right: { style: "thin", color: { argb: "CCCCCC" } },
            };
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
              wrapText: true,
            };
          });
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, filename);
      toast.success("Excel downloaded successfully!");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel file");
    }
  };

  return (
    <button
      onClick={handleDownloadExcel}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center gap-2"
      title="Download Rate Entries as Excel"
    >
      <Download size={16} />
    </button>
  );
};

export default DownloadRateEntriesExcel;
