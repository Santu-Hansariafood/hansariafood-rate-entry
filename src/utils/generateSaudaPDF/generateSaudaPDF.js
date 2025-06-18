import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
  });

export const generateSaudaPDF = async ({
  company,
  date,
  rateData,
  saudaEntries,
  allowedCommodities = [],
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoBase64 = await loadImage("/logo/watermark.png");

  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(company.toUpperCase(), 14, 20);

  const logoWidth = 30;
  const logoHeight = 35;
  doc.addImage(
    logoBase64,
    "PNG",
    pageWidth - logoWidth - 14,
    10,
    logoWidth,
    logoHeight
  );

  const now = new Date();
  const printTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.setFontSize(12);
  doc.setTextColor(255, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${date}`, pageWidth - logoWidth - 14, 50);
  doc.text(`Time: ${printTime}`, pageWidth - logoWidth - 14, 56);

  const allowed = allowedCommodities.length
    ? allowedCommodities
    : [...new Set(Object.keys(saudaEntries).map((k) => k.split("-")[1]))];
  const tableData = [];
  let totalTons = 0;
  Object.entries(saudaEntries).forEach(([key, entries]) => {
    const [location, commodity] = key.split("-");

    if (!allowed.includes(commodity)) return;

    const rateInfo = rateData.find(
      (r) =>
        r.company === company &&
        r.location === location &&
        r.commodity === commodity
    );

    if (!rateInfo || !rateInfo.newRate || rateInfo.newRate === 0) return;

    entries.forEach((entry) => {
      const tons = parseFloat(entry.tons);
      if (!tons || tons === 0) return;

      totalTons += tons;

      tableData.push([
        tableData.length + 1,
        location,
        commodity,
        rateInfo.newRate,
        `${tons} Tons - ${entry.description}`,
        entry.saudaNo,
      ]);
    });
  });

  autoTable(doc, {
    startY: 60,
    head: [
      [
        "Sl No.",
        "Unit",
        "Commodity",
        "Rate",
        "Sauda (Tons + Desc)",
        "Sauda No",
      ],
    ],
    body: tableData,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      halign: "left",
    },
    headStyles: {
      fillColor: [0, 128, 0],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 153],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY || 80;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Sauda: ${totalTons.toFixed(2)} Tons`, 14, finalY + 10);

  const bottomNoteY = finalY + 40;
  doc.setFontSize(12);
  doc.setTextColor(39, 174, 96);
  doc.setFont("helvetica", "italic");
  doc.text("Hansaria Food Private Limited", pageWidth - 80, bottomNoteY);
  doc.text("Purchase Team", pageWidth - 55, bottomNoteY + 10);

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Confidential – compiled exclusively by the Hansaria Food Team for internal reference.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  doc.save(`${company}_${date.replace(/\//g, "-")}_sauda.pdf`);
};
