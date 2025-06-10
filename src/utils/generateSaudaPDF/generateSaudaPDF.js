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

export const generateSaudaPDF = async ({ company, date, rateData, saudaEntries }) => {
  const doc = new jsPDF();

  const logoBase64 = await loadImage("/logo/watermark.png");

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(39, 174, 96);
  doc.setFont("helvetica", "bold");
  doc.text(`${company}`, 14, 20);

  const logoWidth = 30;
  const logoHeight = 35;
  doc.addImage(logoBase64, "PNG", pageWidth - logoWidth - 14, 10, logoWidth, logoHeight);

  doc.setFontSize(12);
  doc.setTextColor(255, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${date}`, pageWidth - logoWidth - 14, 50);

  const tableData = [];

  Object.entries(saudaEntries).forEach(([key, entries], index) => {
    const [location, commodity] = key.split("-");
    const rateInfo = rateData.find(
      (r) =>
        r.company === company &&
        r.location === location &&
        r.commodity === commodity
    );

    if (!rateInfo || !rateInfo.newRate || rateInfo.newRate === 0) return;

    entries.forEach((entry) => {
      if (!entry.tons || parseFloat(entry.tons) === 0) return;

      tableData.push([
        tableData.length + 1,
        location,
        commodity,
        rateInfo.newRate,
        `${entry.tons} Tons - ${entry.description}`,
        entry.saudaNo,
      ]);
    });
  });

  autoTable(doc, {
    startY: 60,
    head: [["Sl No.", "Unit", "Commodity", "Rate", "Sauda (Tons + Desc)", "Sauda No"]],
    body: tableData,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  const finalY = doc.lastAutoTable.finalY || 80;
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.setFont("helvetica", "italic");
  doc.text(
    "* For internal use only. This is not the final or valid document.",
    14,
    finalY + 20
  );

  doc.save(`${company}_${date.replace(/\//g, "-")}_sauda.pdf`);
};
