import { Download } from "lucide-react";

export default function DownloadLandingCostPDF({
  tableRows = [],
  selectedCompany,
  selectedCommodity,
  selectedLocation,
}) {
  const handleDownload = async () => {
    if (!tableRows || tableRows.length === 0) return;

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
      doc.text(
        "Hansaria Food Private Limited",
        pageWidth / 2,
        94,
        {
          align: "center",
        }
      );

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

    const body = tableRows.map((row) => [
      row.slno,
      row.companyName,
      row.commodity,
      row.location,
      row.destination || "—",
      row.baseRate,
      row.freight,
      row.gst,
      row.landed,
    ]);

    autoTable(doc, {
      startY: 132,
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
      body,
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

    doc.save(`Landing_Cost_${selectedCommodity || "report"}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
    >
      <Download className="w-4 h-4" />
      PDF
    </button>
  );
}

