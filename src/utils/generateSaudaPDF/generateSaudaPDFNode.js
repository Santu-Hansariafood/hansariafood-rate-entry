
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const loadImageNode = async (src) => {
  try {
    const filePath = path.join(process.cwd(), "public", src);
    if (fs.existsSync(filePath)) {
      const bitmap = fs.readFileSync(filePath);
      return `data:image/png;base64,${bitmap.toString("base64")}`;
    }
    return null;
  } catch (err) {
    console.error("Error loading image:", err);
    return null;
  }
};

export async function generateSaudaPDFNode({
  company,
  date,
  saudaEntries,
  allowedCommodities = [],
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const headerH = 80;
  const blue = [30, 64, 175];

  const logo64 = await loadImageNode("/logo/watermark1.png");
  
  doc.setFillColor(...blue).rect(0, 0, pageW, headerH, "F");
  doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(255);
  doc.text(company.toUpperCase(), pageW / 2, 50, { align: "center" });
  doc.setFont("helvetica", "italic").setFontSize(12);
  doc.text("Daily Sauda Report", pageW / 2, 66, { align: "center" });
  
  if (logo64) {
    doc.addImage(logo64, "PNG", pageW - 100, 8, 80, 80, undefined, "FAST");
  }

  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(90);
  doc.text(`Date: ${date}`, marginX, headerH + 20);
  doc.text(`Time: ${timeStr}`, pageW - marginX, headerH + 20, {
    align: "right",
  });
  doc.setDrawColor(...blue).setLineWidth(1);
  doc.line(marginX, headerH + 32, pageW - marginX, headerH + 32);

  const allowed = allowedCommodities.length
    ? allowedCommodities
    : [...new Set(Object.keys(saudaEntries).map((k) => k.split("-")[1]))];

  const body = [];
  let totalTons = 0;
  const formatSaudaNo = (value) =>
    value ? value.toString().slice(-4) : "";

  Object.entries(saudaEntries).forEach(([key, list]) => {
    const [unit, com] = key.split("-");

    if (!allowed.includes(com)) return;

    list.forEach((row) => {
      const rate = parseFloat(row.finalRate);
      const tons = parseFloat(row.tons);

      if (!tons || !rate) return;

      totalTons += tons;

      const companyText = row.sellerCompany || "";
      const notesText = row.others || "";

      const capitalizedCompany = companyText
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      const formattedNotes = notesText ? ` (${notesText})` : "";

      const detailsLine = capitalizedCompany + formattedNotes;

      body.push([
        body.length + 1,
        `${unit}\n`,
        com,
        `${rate}`,
        `${tons} Tons\n${detailsLine}`,
        formatSaudaNo(row.saudaNo),
      ]);
    });
  });

  if (body.length === 0) {
    // Should not happen if called correctly, but handle empty case
    doc.text("No records found.", marginX, headerH + 60);
    return Buffer.from(doc.output("arraybuffer"));
  }

  autoTable(doc, {
    startY: headerH + 42,
    head: [["Sl", "Unit", "Commodity", "Rate", "Sauda (Tons + Desc)", "No"]],
    body,
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [75, 85, 99], textColor: 255, halign: "center" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 72 },
      2: { cellWidth: 90 },
      3: { cellWidth: 50, halign: "right" },
      4: { halign: "left" },
      5: { cellWidth: 50, textColor: [220, 38, 38], halign: "center" },
    },

    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        data.cell.text = "";
      }
    },

    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const rowData = body[data?.row?.index];
        if (!rowData || !rowData[4]) {
          return;
        }

        const cell = data.cell;
        const [tonsLine = "", descLine = ""] = rowData[4].split("\n");

        const x = cell.x + 2;
        const y = cell.y + 12;

        doc
          .setFont("helvetica", "bold")
          .setFontSize(10)
          .setTextColor(22, 163, 74);
        doc.text(tonsLine, x, y);

        doc.setFont("helvetica", "italic").setFontSize(10).setTextColor(55);
        doc.text(descLine, x, y + 12);
      }
    },
  });

  const tableEndY = doc.lastAutoTable.finalY;
  const footerY = tableEndY + 25;

  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(0);
  doc.text(
    `Total Sauda: ${totalTons.toFixed(2)} Tons`,
    pageW - marginX,
    footerY,
    {
      align: "right",
    }
  );

  doc
    .setFont("helvetica", "italic")
    .setFontSize(11)
    .setTextColor(...blue);
  const lines = [
    "Thanks and Regards,",
    "Purchase Team",
    "Hansaria Food Private Limited",
  ];
  lines.forEach((ln, idx) =>
    doc.text(ln, pageW - marginX, footerY + 15 + idx * 14, { align: "right" })
  );

  const qrData = `https://www.justdial.com/Kolkata/Hansaria-Food-Pvt-Ltd-Near-Posta-Petrol-Pump-Posta/033PXX33-XX33-101031124816-Z1Y8_BZDET`;
  const qr64 = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });
  doc.addImage(qr64, "PNG", pageW / 2 - 50, footerY + 15, 100, 100);

  doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(120);
  doc.text(
    "Confidential — compiled exclusively by the Hansaria Food Team for internal reference.",
    pageW / 2,
    pageH - 30,
    { align: "center" }
  );

  // Return Buffer
  return Buffer.from(doc.output("arraybuffer"));
}
