import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

export default function DownloadLandingCostPDF({
  tableRows = [],
  selectedCompany,
  selectedCommodity,
  selectedLocation,
}) {
  const handleDownload = () => {
    if (!tableRows || tableRows.length === 0) return;

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

    const today = new Date();
    const dateToShow = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    const timeToShow = today.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    function drawHeaderFooter(doc, pageWidth, pageHeight, date, time) {
      try {
        doc.addImage("/logo/logo1.png", "PNG", 40, 25, 110, 38);
      } catch {}

      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Date: ${date}`, pageWidth - 40, 32, { align: "right" });

      doc.setTextColor(37, 99, 235);
      doc.text(`Time: ${time}`, pageWidth - 40, 48, { align: "right" });

      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.setTextColor(0);
      doc.text("LANDING COST REPORT", pageWidth / 2, 85, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(
        `Hansaria Food Private Limited • ${date} ${time} • Thanks`,
        pageWidth / 2,
        102,
        {
          align: "center",
        }
      );

      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(1.2);
      doc.line(40, 112, pageWidth - 40, 112);

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
      doc.text(subtitle, pageWidth / 2, 122, { align: "center" });
    }

    const body = tableRows.map((row) => [
      row.slno,
      row.companyName,
      row.commodity,
      row.location,
      row.destination || "—",
      row.baseRate,
      row.freight,
      row.landed,
      new Date(row.date).toLocaleDateString("en-IN"),
    ]);

    autoTable(doc, {
      startY: 140,
      margin: { top: 140, left: marginLeft, right: marginRight },
      pageBreak: "auto",
      rowPageBreak: "avoid",
      head: [
        [
          "Sl No",
          "Company",
          "Commodity",
          "Location",
          "Destination",
          "Base Rate (₹)",
          "Freight (₹)",
          "Landed (₹)",
          "Date",
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
        0: { cellWidth: usableWidth * 0.06, halign: "center" },
        1: { cellWidth: usableWidth * 0.18 },
        2: { cellWidth: usableWidth * 0.12 },
        3: { cellWidth: usableWidth * 0.12 },
        4: { cellWidth: usableWidth * 0.12 },
        5: { cellWidth: usableWidth * 0.12, halign: "right" },
        6: { cellWidth: usableWidth * 0.1, halign: "right" },
        7: { cellWidth: usableWidth * 0.12, halign: "right" },
        8: { cellWidth: usableWidth * 0.06 },
      },
      didDrawPage: () => {
        drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
      },
    });

    const fileSafeTime = timeToShow.replace(/:/g, "-").replace(/ /g, "_");

    doc.save(
      `Landing_Cost_${selectedCommodity || "report"}_${dateToShow}_${fileSafeTime}_Thanks.pdf`
    );
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

