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

export async function generateAnalyticsPDF({ data, period, aiAnalysis }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const headerH = 90;

  const blue = [30, 64, 175];
  const emerald = [16, 185, 129];
  const gray = [107, 114, 128];

  const logo64 = await loadImage("/logo/watermark1.png");
  const today = new Date().toLocaleDateString("en-IN");

  const periodLabel =
    period === "monthly"
      ? "Last 6 Months (Month-Wise)"
      : `Last ${period.replace("days", "")} Days (Daily)`;

  const drawHeader = (doc, pageNum) => {
    doc.setFillColor(...blue).rect(0, 0, pageW, headerH, "F");

    doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(255);
    doc.text("HANSARIA FOOD PRIVATE LIMITED", marginX, 40);

    doc.setFont("helvetica", "normal").setFontSize(12);
    doc.text("Business Performance Analytics", marginX, 60);

    doc.addImage(logo64, "PNG", pageW - 90, 15, 60, 60);

    doc.setFontSize(8);
    doc.text(`Page ${pageNum}`, pageW - marginX, 75, {
      align: "right",
    });
  };

  const drawFooter = () => {
    const y = pageH - 40;

    doc.setDrawColor(220);
    doc.line(marginX, y - 10, pageW - marginX, y - 10);

    doc
      .setFont("helvetica", "italic")
      .setFontSize(8)
      .setTextColor(...gray);
    doc.text(
      "Confidential Performance Report - Hansaria Food Analytics Division",
      marginX,
      y,
    );

    doc.text(`Generated on: ${today}`, pageW - marginX, y, {
      align: "right",
    });
  };

  drawHeader(doc, 1);

  let currentY = headerH + 40;

  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(30);
  doc.text(`${periodLabel} Report`, marginX, currentY);

  currentY += 25;

  const summaryItems = [
    {
      label: "Total Volume",
      value: `${data.summary.totalTonsDone} Tons`,
      color: emerald,
    },
    {
      label: "Rate Entries",
      value: `${data.summary.totalRateEntries}`,
      color: blue,
    },
    {
      label: "Closed Saudas",
      value: `${data.summary.totalSaudasDone}`,
      color: [79, 70, 229],
    },
    {
      label: "Conversion",
      value: `${data.summary.conversionRate}%`,
      color: [147, 51, 234],
    },
  ];

  const cardW = (pageW - marginX * 2 - 30) / 4;

  summaryItems.forEach((item, i) => {
    const x = marginX + i * (cardW + 10);

    doc.setFillColor(248, 250, 252);
    doc.rect(x, currentY, cardW, 50, "F");

    doc.setDrawColor(226, 232, 240);
    doc.rect(x, currentY, cardW, 50);

    doc.setFontSize(8).setTextColor(...gray);
    doc.text(item.label.toUpperCase(), x + 10, currentY + 18);

    doc.setFontSize(11).setTextColor(...item.color);
    doc.text(item.value, x + 10, currentY + 38);
  });

  currentY += 80;

  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(30);
  doc.text("PERIODIC ACTIVITY BREAKDOWN", marginX, currentY);

  currentY += 15;

  const tableBody = data.dailyData.map((d, index) => [
    index + 1,
    d.displayDate,
    d.rateEntries,
    d.saudasDone,
    `${d.totalTons} T`,
  ]);

  const totalRate = data.dailyData.reduce((sum, d) => sum + d.rateEntries, 0);
  const totalSaudas = data.dailyData.reduce((sum, d) => sum + d.saudasDone, 0);
  const totalTons = data.dailyData.reduce((sum, d) => sum + d.totalTons, 0);

  tableBody.push(["", "TOTAL", totalRate, totalSaudas, `${totalTons} T`]);

  autoTable(doc, {
    startY: currentY,
    head: [
      ["S.No", "Period", "Rate Entries", "Saudas Closed", "Volume (Tons)"],
    ],
    body: tableBody,
    theme: "grid",

    headStyles: {
      fillColor: blue,
      textColor: 255,
      halign: "center",
    },

    columnStyles: {
      0: { halign: "center" },
      1: { halign: "left", fontStyle: "bold" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "right", textColor: emerald, fontStyle: "bold" },
    },

    didParseCell: function (dataCell) {
      if (dataCell.row.index === tableBody.length - 1) {
        dataCell.cell.styles.fillColor = [240, 253, 244];
        dataCell.cell.styles.textColor = emerald;
        dataCell.cell.styles.fontStyle = "bold";
      }
    },

    styles: {
      fontSize: 9,
      cellPadding: 8,
    },

    margin: { left: marginX, right: marginX },
  });

  currentY = doc.lastAutoTable.finalY + 30;

  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Recent Transactions", marginX, currentY);

  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [["Date", "Company", "Location", "Commodity", "Tons"]],
    body: data.worksDone?.map((w) => [
      new Date(w.timestamp).toLocaleDateString(),
      w.company,
      w.unit,
      w.commodity,
      `${w.tons} T`,
    ]) || [["-", "No data", "-", "-", "-"]],
  });

  drawFooter();

  doc.addPage();
  drawHeader(doc, 2);

  currentY = headerH + 40;

  doc
    .setFont("helvetica", "bold")
    .setFontSize(14)
    .setTextColor(...emerald);
  doc.text("Intelligence & Market Analysis", marginX, currentY);

  currentY += 25;

  const lines = doc.splitTextToSize(
    aiAnalysis || "No AI insights available.",
    pageW - marginX * 2,
  );

  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(60);

  lines.forEach((line) => {
    if (currentY > pageH - 60) {
      drawFooter();
      doc.addPage();
      drawHeader(doc, doc.internal.getNumberOfPages());
      currentY = headerH + 40;
    }

    doc.text(line, marginX, currentY);
    currentY += 14;
  });

  const qr = await QRCode.toDataURL(`REPORT_${period}_${today}`, { width: 80 });

  doc.addImage(qr, "PNG", marginX, pageH - 120, 80, 80);

  drawFooter();

  doc.save(`Performance_Report_${period}_${today.replace(/\//g, "-")}.pdf`);
}
