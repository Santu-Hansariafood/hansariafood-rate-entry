"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "@/utils/toast/toast";

export default function DownloadLandingCostPDF({
  tableRows = [],
  selectedCompany,
  selectedCommodity,
  selectedLocation,
}) {
  const [includeComplete, setIncludeComplete] = useState(true);
  const [includeIncomplete, setIncludeIncomplete] = useState(true);

  const handleDownload = async () => {
    if (!tableRows || tableRows.length === 0) {
      toast.error("No landing cost data available to export");
      return;
    }

    if (!includeComplete && !includeIncomplete) {
      toast.error("Select complete or incomplete data before downloading");
      return;
    }

    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "A4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const marginLeft = 40;
      const marginRight = 40;
      const usableWidth = pageWidth - marginLeft - marginRight;

      function drawHeaderFooter(doc, pageWidth, pageHeight) {
        try {
          doc.addImage("/logo/logo1.png", "PNG", 40, 25, 110, 38);
        } catch {}

        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.text("LANDING COST REPORT", pageWidth / 2, 76, { align: "center" });

        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Hansaria Food Private Limited", pageWidth / 2, 94, {
          align: "center",
        });

        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(1.2);
        doc.line(40, 104, pageWidth - 40, 104);

        doc.setFontSize(9);
        doc.setTextColor(130);
        doc.text(
          "Confidential — compiled exclusively by Hansaria Food Pvt. Ltd.",
          pageWidth / 2,
          pageHeight - 18,
          { align: "center" }
        );
      }

      const subtitle = [
        selectedCompany || "",
        selectedCommodity || "",
        selectedLocation || "",
      ]
        .filter(Boolean)
        .join(" • ");

      if (subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(subtitle, pageWidth / 2, 116, { align: "center" });
      }

      const completeRows = includeComplete
        ? tableRows
            .filter((row) =>
              row.hasFreight === undefined
                ? Number(row.freight) > 0
                : row.hasFreight
            )
            .sort((a, b) => Number(a.landed) - Number(b.landed))
        : [];
      const incompleteRows = includeIncomplete
        ? tableRows
            .filter((row) =>
              row.hasFreight === undefined
                ? Number(row.freight) <= 0
                : !row.hasFreight
            )
            .sort((a, b) => Number(a.landed) - Number(b.landed))
        : [];

      let nextY = 142;
      const sections = [
        { title: "Complete Data (Freight Available)", rows: completeRows },
        { title: "Incomplete Data (Freight Not Available)", rows: incompleteRows },
      ].filter((section) => section.rows.length > 0);

      sections.forEach((section) => {
        if (nextY > pageHeight - 100) {
          doc.addPage();
          nextY = 142;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(section.title, marginLeft, nextY);

        autoTable(doc, {
          startY: nextY + 8,
          margin: { top: 132, left: marginLeft, right: marginRight },
          pageBreak: "auto",
          rowPageBreak: "avoid",
          head: [
            [
              "Sl No",
              "Company",
              "Commodity",
              "Location",
              "Destination",
              "Base Rate",
              "Freight",
              "GST",
              "Landed Cost",
            ],
          ],
          body: section.rows.map((row, index) => [
            index + 1,
            row.companyName,
            row.commodity,
            row.location,
            row.destination || "—",
            row.baseRate,
            row.freight,
            row.gst,
            row.landed,
          ]),
          theme: "grid",
          tableWidth: usableWidth,
          styles: {
            fontSize: 9,
            cellPadding: 6,
            valign: "middle",
          },
          headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: usableWidth * 0.05, halign: "center" },
            1: { cellWidth: usableWidth * 0.16 },
            2: { cellWidth: usableWidth * 0.12 },
            3: { cellWidth: usableWidth * 0.11 },
            4: { cellWidth: usableWidth * 0.11 },
            5: { cellWidth: usableWidth * 0.12, halign: "right" },
            6: { cellWidth: usableWidth * 0.11, halign: "right" },
            7: { cellWidth: usableWidth * 0.10, halign: "right" },
            8: { cellWidth: usableWidth * 0.12, halign: "right" },
          },
          didDrawPage: () => {
            drawHeaderFooter(doc, pageWidth, pageHeight);
          },
        });

        nextY = doc.lastAutoTable.finalY + 30;
      });

      doc.save(`Landing_Cost_${selectedCommodity || "report"}.pdf`);
    } catch (downloadError) {
      console.error("Error exporting landing cost to PDF:", downloadError);
      toast.error("Failed to download the PDF file");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={includeComplete}
          onChange={(event) => setIncludeComplete(event.target.checked)}
          className="accent-emerald-600"
        />
        Complete
      </label>
      <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={includeIncomplete}
          onChange={(event) => setIncludeIncomplete(event.target.checked)}
          className="accent-emerald-600"
        />
        Incomplete
      </label>
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Download className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
}

