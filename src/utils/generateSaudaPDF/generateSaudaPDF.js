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
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.addImage(logoBase64, "PNG", pageWidth / 2 - 50, pageHeight / 2 - 50, 100, 100, undefined, "FAST");
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(16);
  doc.text(`Sauda Summary - ${company}`, 14, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${date}`, pageWidth - 60, 20);

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

    entries.forEach((entry, i) => {
      tableData.push([
        index + 1,
        location,
        commodity,
        rateInfo.newRate,
        `${entry.tons} Tons - ${entry.description}`,
        entry.saudaNo,
      ]);
    });
  });

  autoTable(doc, {
    startY: 35,
    head: [["Sl No.", "Unit", "Commodity", "Rate", "Sauda (Tons + Desc)", "Sauda No"]],
    body: tableData,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`${company}_${date.replace(/\//g, "-")}_sauda.pdf`);
};
