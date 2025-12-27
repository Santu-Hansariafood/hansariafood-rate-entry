import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadSaudaPDF = (
  data,
  date,
  companyName = "HANSARIA FOOD PRIVATE LIMITED"
) => {
  const doc = new jsPDF("l", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const logoUrl = "/logo/logo1.png";
  doc.addImage(logoUrl, "PNG", 14, 10, 30, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(companyName, pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(12);
  doc.text("Previous Sauda Report", pageWidth / 2, 26, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Date: ${date}`, 14, 36);
  doc.text(`Time: ${time}`, pageWidth - 14, 36, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 40, pageWidth - 14, 40);

  const head = [[
    "S.No",
    "Buyer Company",
    "Consignee",
    "Sauda No",
    "Commodity",
    "Delivery Date",
    "Seller Company",
    "Tons",
    "Final Rate",
    "Status",
    "Others",
  ]];

  const body = data.map((item) => [
    item.sl,
    item.buyerCompany,
    item.consigneeName || "",
    item.saudaNo,
    item.commodity,
    item.deliveryDate,
    item.sellerCompany,
    item.tons,
    item.finalRate,
    item.statusText || "Pending",
    item.others || "",
  ]);

  autoTable(doc, {
    startY: 45,
    head,
    body,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: "middle",
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      halign: "center",
    },
    bodyStyles: {
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    columnStyles: {
      3: { textColor: [220, 38, 38], fontStyle: "bold" },
    },
    margin: { left: 10, right: 10 },
    didDrawPage: () => {
      const pageNo = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${pageNo}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    },
  });

  const totalTons = data.reduce(
    (sum, item) => sum + Number(item.tons || 0),
    0
  );

  let finalY = doc.lastAutoTable.finalY + 8;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(
    `Total Sauda: ${totalTons.toFixed(2)} Tons`,
    pageWidth - 14,
    finalY,
    { align: "right" }
  );

  finalY += 18;
  doc.setFont("helvetica", "normal");
  doc.text("Thanks and Regards,", pageWidth - 14, finalY, {
    align: "right",
  });
  doc.text("Purchase Team", pageWidth - 14, finalY + 6, {
    align: "right",
  });
  doc.text(companyName, pageWidth - 14, finalY + 12, {
    align: "right",
  });

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    "Confidential — compiled exclusively by the Hansaria Food Team for internal reference.",
    pageWidth / 2,
    pageHeight - 18,
    { align: "center" }
  );

  doc.save(`Daily_Sauda_${date}.pdf`);
};
