import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
  });

export async function generateSaudaPDF({
  company,
  date,
  rateData,
  saudaEntries,
  allowedCommodities = [],
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const headerH = 80;
  const blue = [30, 64, 175];

  const logo64 = await loadImage("/logo/watermark.png");

  doc.setFillColor(...blue).rect(0, 0, pageW, headerH, "F");

  doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(255);
  doc.text(company.toUpperCase(), pageW / 2, 50, { align: "center" });

  doc.setFont("helvetica", "italic").setFontSize(12);
  doc.text("Daily Sauda Report", pageW / 2, 66, { align: "center" });

  doc.addImage(logo64, "PNG", pageW - 100, 8, 80, 80, undefined, "FAST");

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

  Object.entries(saudaEntries).forEach(([key, list]) => {
    const [unit, com] = key.split("-");

    if (!allowed.includes(com)) return;

    const rate = rateData.find(
      (r) => r.company === company && r.location === unit && r.commodity === com
    )?.newRate;
    if (!rate) return;

    list.forEach((row) => {
      const tons = parseFloat(row.tons);
      if (!tons) return;
      totalTons += tons;

      body.push([
        body.length + 1,
        unit,
        com,
        `${rate}`,
        `${tons} Tons\n${row.description}`,
        row.saudaNo,
      ]);
    });
  });

  if (body.length === 0) {
    alert("Nothing to print — no rows match your filter.");
    return;
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
        const cell = data.cell;
        const [tonsLine, descLine] = body[data.row.index][4].split("\n");

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

  const qrData = `https://hansariafood.site`;
  const qr64 = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });
  doc.addImage(qr64, "PNG", pageW / 2 - 50, footerY + 15, 100, 100);

  doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(120);
  doc.text(
    "Confidential — compiled exclusively by the Hansaria Food Team for internal reference.",
    pageW / 2,
    pageH - 30,
    { align: "center" }
  );

  doc.save(`${company}_${date.replace(/\//g, "-")}_sauda.pdf`);
}
