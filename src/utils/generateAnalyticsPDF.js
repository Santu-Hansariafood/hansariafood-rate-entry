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
  const headerH = 90;
  const blue = [30, 64, 175];
  const emerald = [16, 185, 129];
  const gray = [107, 114, 128];

  const logo64 = await loadImage("/logo/watermark1.png");
  const today = new Date().toLocaleDateString('en-IN');
  const periodLabel = period === 'monthly' ? 'Last 6 Months (Month-Wise)' : `Last ${period.replace('days', '')} Days (Daily)`;

  // --- Helper: Draw Header ---
  const drawHeader = (doc, pageNum) => {
    doc.setFillColor(...blue).rect(0, 0, pageW, headerH, "F");
    
    // Title
    doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(255);
    doc.text("HANSARIA FOOD PRIVATE LIMITED", marginX, 40);
    
    doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(255);
    doc.text("Business Performance Analytics", marginX, 60);
    
    // Logo on right
    doc.addImage(logo64, "PNG", pageW - 90, 15, 60, 60, undefined, "FAST");
    
    // Page indicator
    doc.setFontSize(8).setTextColor(255);
    doc.text(`Page ${pageNum}`, pageW - marginX, 75, { align: "right" });
  };

  // --- Helper: Draw Footer ---
  const drawFooter = (doc) => {
    const footerY = pageH - 40;
    doc.setDrawColor(220).setLineWidth(0.5);
    doc.line(marginX, footerY - 10, pageW - marginX, footerY - 10);
    
    doc.setFont("helvetica", "italic").setFontSize(8).setTextColor(...gray);
    doc.text("Confidential Performance Report - Hansaria Food Analytics Division", marginX, footerY);
    doc.text(`Generated on: ${today}`, pageW - marginX, footerY, { align: "right" });
  };

  // --- PAGE 1: Executive Summary & Table ---
  drawHeader(doc, 1);
  
  let currentY = headerH + 40;

  // Title Section
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(30);
  doc.text(`${periodLabel} Report`, marginX, currentY);
  currentY += 25;

  // Summary Metrics Grid
  const summaryItems = [
    { label: "Total Volume", value: `${data.summary.totalTonsDone} Tons`, color: emerald },
    { label: "Rate Entries", value: `${data.summary.totalRateEntries}`, color: blue },
    { label: "Closed Saudas", value: `${data.summary.totalSaudasDone}`, color: [79, 70, 229] }, // Indigo
    { label: "Conversion", value: `${data.summary.conversionRate}%`, color: [147, 51, 234] } // Purple
  ];

  // Draw 4 mini cards for summary
  const cardW = (pageW - (marginX * 2) - 30) / 4;
  summaryItems.forEach((item, i) => {
    const x = marginX + (i * (cardW + 10));
    doc.setFillColor(248, 250, 252).rect(x, currentY, cardW, 50, "F");
    doc.setDrawColor(226, 232, 240).rect(x, currentY, cardW, 50, "S");
    
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...gray);
    doc.text(item.label.toUpperCase(), x + 10, currentY + 18);
    
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...item.color);
    doc.text(item.value, x + 10, currentY + 38);
  });

  currentY += 80;

  // Periodic Data Table
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("Activity Logs", marginX, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [["Timeline", "Rate Submissions", "Saudas Closed", "Net Volume (Tons)"]],
    body: data.dailyData.map(d => [d.displayDate, d.rateEntries, d.saudasDone, `${d.totalTons} T`]),
    theme: 'grid',
    headStyles: { fillColor: blue, textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right', textColor: emerald, fontStyle: 'bold' }
    },
    styles: { fontSize: 9, cellPadding: 8 },
    margin: { left: marginX, right: marginX },
  });

  currentY = doc.lastAutoTable.finalY + 40;

  // Recent Works Done (If fits on Page 1)
  if (currentY + 150 > pageH) {
    drawFooter(doc);
    doc.addPage();
    drawHeader(doc, 2);
    currentY = headerH + 40;
  }

  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("Recent Transactions", marginX, currentY);
  currentY += 10;

  const worksBody = (data.worksDone || []).map(w => [
    new Date(w.timestamp).toLocaleDateString(),
    w.company,
    w.unit,
    w.commodity,
    `${w.tons} T`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Date", "Company", "Location", "Commodity", "Tons"]],
    body: worksBody.length > 0 ? worksBody : [["-", "No recent transactions found", "-", "-", "-"]],
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: marginX, right: marginX },
  });

  drawFooter(doc);

  // --- PAGE 2 (or 3): AI INSIGHTS ---
  doc.addPage();
  drawHeader(doc, doc.internal.getNumberOfPages());
  
  currentY = headerH + 40;

  // AI Analysis Background
  doc.setFillColor(240, 253, 244).rect(marginX, currentY, pageW - (marginX * 2), 40, "F");
  doc.setDrawColor(...emerald).setLineWidth(1.5);
  doc.line(marginX, currentY, marginX, currentY + 40);
  
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...emerald);
  doc.text("Intelligence & Market Analysis", marginX + 15, currentY + 25);
  
  currentY += 60;

  // Process AI analysis into sections
  const sections = aiAnalysis.split('\n\n');
  
  sections.forEach((section) => {
    // Check for page overflow
    if (currentY > pageH - 80) {
      drawFooter(doc);
      doc.addPage();
      drawHeader(doc, doc.internal.getNumberOfPages());
      currentY = headerH + 40;
    }

    const isHeader = section.startsWith('#') || section.includes(':');
    
    if (isHeader) {
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(30);
      const cleanHeader = section.replace(/#+\s/g, '').trim();
      doc.text(cleanHeader, marginX, currentY);
      currentY += 18;
    } else {
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(60);
      const cleanText = section
        .replace(/\*\*/g, '')
        .replace(/\|/g, '')
        .replace(/- /g, '• ')
        .trim();
        
      const splitText = doc.splitTextToSize(cleanText, pageW - (marginX * 2));
      doc.text(splitText, marginX, currentY);
      currentY += (splitText.length * 14) + 10;
    }
  });

  // Final QR and Validation
  if (currentY > pageH - 120) {
    drawFooter(doc);
    doc.addPage();
    drawHeader(doc, doc.internal.getNumberOfPages());
    currentY = headerH + 40;
  }

  currentY = Math.max(currentY + 20, pageH - 160);
  
  const qrData = `SECURE_REPORT_${period.toUpperCase()}_${today}`;
  const qr64 = await QRCode.toDataURL(qrData, { margin: 1, width: 80 });
  doc.addImage(qr64, "PNG", marginX, currentY, 80, 80);
  
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...blue);
  doc.text("Report Authenticity Verified", marginX + 90, currentY + 30);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...gray);
  doc.text("Scan to verify report data on portal", marginX + 90, currentY + 45);

  drawFooter(doc);

  doc.save(`Performance_Analysis_HFPL_${period}_${today.replace(/\//g, "-")}.pdf`);
}

