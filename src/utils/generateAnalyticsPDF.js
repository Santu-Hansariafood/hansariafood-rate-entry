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

export async function generateAnalyticsPDF({
  data,
  period,
  aiAnalysis,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const headerH = 80;
  const blue = [30, 64, 175];
  const emerald = [16, 185, 129];

  const logo64 = await loadImage("/logo/watermark1.png");
  
  // Header background
  doc.setFillColor(...blue).rect(0, 0, pageW, headerH, "F");
  
  // Header Title
  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(255);
  doc.text("HANSARIA FOOD PRIVATE LIMITED", pageW / 2, 45, { align: "center" });
  
  doc.setFont("helvetica", "italic").setFontSize(14).setTextColor(255);
  doc.text("Business Performance Analytics Report", pageW / 2, 65, { align: "center" });
  
  // Logo
  doc.addImage(logo64, "PNG", pageW - 90, 10, 60, 60, undefined, "FAST");

  // Report Info
  const today = new Date().toLocaleDateString('en-IN');
  const periodLabel = period === 'monthly' ? 'Last 6 Months' : `Last ${period.replace('days', '')} Days`;

  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(75);
  doc.text(`Period: ${periodLabel}`, marginX, headerH + 25);
  doc.text(`Report Date: ${today}`, pageW - marginX, headerH + 25, { align: "right" });

  doc.setDrawColor(...blue).setLineWidth(1);
  doc.line(marginX, headerH + 35, pageW - marginX, headerH + 35);

  // Summary Cards Section
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("Executive Summary", marginX, headerH + 60);

  const summaryData = [
    ["KPI Metric", "Value"],
    ["Total Rate Entries", `${data.summary.totalRateEntries}`],
    ["Total Sauda Volume", `${data.summary.totalTonsDone} Tons`],
    ["Total Saudas Done", `${data.summary.totalSaudasDone}`],
    ["Avg. Conversion", `${data.summary.conversionRate}%`],
  ];

  autoTable(doc, {
    startY: headerH + 70,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: emerald, textColor: 255 },
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 10 },
  });

  // Daily Activity Table
  let currentY = doc.lastAutoTable.finalY + 30;
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("Detailed Periodic Activity", marginX, currentY);

  const tableBody = data.dailyData.map(d => [
    d.displayDate,
    d.rateEntries,
    d.saudasDone,
    `${d.totalTons} T`
  ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [["Date / Month", "Rate Entries", "Saudas Done", "Total Volume"]],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [75, 85, 99], textColor: 255 },
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9 },
  });

  // AI Insights Section
  currentY = doc.lastAutoTable.finalY + 40;
  
  // Check if we need a new page for AI Insights
  if (currentY > pageH - 150) {
    doc.addPage();
    currentY = 50;
  }

  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("AI-Powered Performance Insights", marginX, currentY);
  
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(50);
  
  // Clean up AI Analysis markdown for PDF
  const cleanAnalysis = aiAnalysis
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\|/g, '') // Remove table separators
    .replace(/- /g, '• '); // Replace dashes with bullets

  const splitAnalysis = doc.splitTextToSize(cleanAnalysis, pageW - (marginX * 2));
  doc.text(splitAnalysis, marginX, currentY + 20);

  // Footer
  const footerY = pageH - 80;
  doc.setFont("helvetica", "italic").setFontSize(10).setTextColor(...blue);
  const footerLines = [
    "Hansaria Food Private Limited",
    "Analytics Division",
    "Confidential Document",
  ];
  footerLines.forEach((ln, idx) =>
    doc.text(ln, pageW - marginX, footerY + idx * 14, { align: "right" })
  );

  const qrData = `Performance Analytics - ${periodLabel} - ${today}`;
  const qr64 = await QRCode.toDataURL(qrData, { margin: 1, width: 60 });
  doc.addImage(qr64, "PNG", marginX, footerY - 10, 60, 60);

  doc.setFont("helvetica", "italic").setFontSize(8).setTextColor(150);
  doc.text(
    "This report is automatically generated based on real-time transaction data and market participation records.",
    pageW / 2,
    pageH - 20,
    { align: "center" }
  );

  doc.save(`Analytics_Report_${period}_${today.replace(/\//g, "-")}.pdf`);
}
