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

export async function generateRatePDF({
  company,
  date,
  rateData,
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
  doc.text("Daily Rate Sheet", pageW / 2, 66, { align: "center" });
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

  const wanted =
    allowedCommodities.length > 0 ? new Set(allowedCommodities) : null;

  const body = [];
  let sl = 1;
  rateData.forEach(({ company: c, location, commodity, newRate }) => {
    if (c !== company || !newRate) return;
    if (wanted && !wanted.has(commodity)) return;
    body.push([sl++, location, commodity, newRate]);
  });

  if (body.length === 0) {
    alert("Nothing to print — no rates match your filter.");
    return;
  }

  autoTable(doc, {
    startY: headerH + 42,
    head: [["Sl", "Unit", "Commodity", "Rate"]],
    body,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [75, 85, 99],
      textColor: 255,
      halign: "center",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const tableEndY = doc.lastAutoTable.finalY;

  const footerY = tableEndY + 25;
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
    doc.text(ln, pageW - marginX, footerY + idx * 14, { align: "right" })
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

  doc.save(`${company}_${date.replace(/\//g, "-")}_Rate.pdf`);
}
