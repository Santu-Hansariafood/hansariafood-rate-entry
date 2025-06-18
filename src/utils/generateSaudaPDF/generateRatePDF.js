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

export const generateRatePDF = async ({
  company,
  date,
  rateData,
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

  const wanted =
    allowedCommodities.length > 0 ? new Set(allowedCommodities) : null;

  const tableData = [];
  let serialNumber = 1;

  rateData.forEach(({ company: c, location, commodity, newRate }) => {
    if (c !== company || !newRate) return;
    if (wanted && !wanted.has(commodity)) return;

    tableData.push([serialNumber++, location, commodity, newRate]);
  });

  autoTable(doc, {
    startY: 60,
    head: [["Sl No.", "Unit", "Commodity", "Rate"]],
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
    "*Confidential – compiled exclusively by the Hansaria Food Team for internal reference.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  doc.save(`${company}_${date.replace(/\//g, "-")}_Rate.pdf`);
};
