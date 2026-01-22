import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

const DownloadSaudaEntriesPDF = ({ saudaGroups, mobileToName, date }) => {
  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginLeft = 40;
    const marginRight = 40;
    const usableWidth = pageWidth - marginLeft - marginRight;

    const dateToShow =
      date || new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const timeToShow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    function drawHeaderFooter(doc, pageWidth, pageHeight, date, time) {
      try {
        doc.addImage("/logo/logo1.png", "PNG", 40, 25, 110, 38);
      } catch (e) {
        console.warn("Logo not found", e);
      }

      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Date: ${date}`, pageWidth - 40, 32, { align: "right" });

      doc.setTextColor(37, 99, 235);
      doc.text(`Time: ${time}`, pageWidth - 40, 48, { align: "right" });

      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.setTextColor(0);
      doc.text("SAUDA ENTRIES REPORT", pageWidth / 2, 85, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("Hansaria Food Private Limited", pageWidth / 2, 102, {
        align: "center",
      });

      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(1.2);
      doc.line(40, 112, pageWidth - 40, 112);

      doc.setFontSize(9);
      doc.setTextColor(130);
      doc.text(
        "Confidential — compiled exclusively by Hansaria Food Pvt. Ltd.",
        pageWidth / 2,
        pageHeight - 18,
        { align: "center" }
      );
    }

    const tableBody = [];

    saudaGroups.forEach(([mobile, data]) => {
      const userName = mobileToName[mobile] || mobile;

      tableBody.push([
        {
          content: userName,
          colSpan: 6,
          styles: {
            fillColor: [255, 240, 200],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "left",
          },
        },
      ]);

      data.saudas.forEach((sauda) => {
        tableBody.push([
          sauda.company,
          sauda.saudaNo || "-",
          sauda.commodity,
          `${sauda.tons} Tons`,
          `Rs. ${sauda.finalRate}`,
          sauda.sellerName,
        ]);
      });
    });

    autoTable(doc, {
      startY: 140,
      margin: { top: 140, left: marginLeft, right: marginRight },
      pageBreak: "auto",
      rowPageBreak: "avoid",

      head: [
        ["Company", "Sauda #", "Commodity", "Quantity", "Rate", "Seller"],
      ],
      body: tableBody,

      theme: "grid",
      tableWidth: usableWidth,

      styles: {
        fontSize: 9,
        cellPadding: 6,
        valign: "middle",
      },

      headStyles: {
        fillColor: [255, 165, 0],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },

      columnStyles: {
        0: { cellWidth: usableWidth * 0.22 },
        1: { cellWidth: usableWidth * 0.1, halign: "center" },
        2: { cellWidth: usableWidth * 0.18 },
        3: { cellWidth: usableWidth * 0.15, halign: "right" },
        4: { cellWidth: usableWidth * 0.15, halign: "right" },
        5: { cellWidth: usableWidth * 0.2 },
      },

      didDrawPage: () => {
        drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
      },
    });

    let finalY = doc.lastAutoTable.finalY + 30;

    if (finalY + 120 > pageHeight) {
      doc.addPage();
      drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
      finalY = 140;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text("For Trades, please contact:", pageWidth / 2, finalY, {
      align: "center",
    });

    const boxY = finalY + 14;
    const boxWidth = (pageWidth - 120) / 2;

    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(37, 99, 235);
    doc.roundedRect(50, boxY, boxWidth, 80, 8, 8, "FD");

    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text("Gopal Agarwal", 64, boxY + 24);
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text("Mobile: +91 9830433535", 64, boxY + 40);
    doc.text("Email: gopal@hansariafood.com", 64, boxY + 56);

    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(168, 85, 247);
    doc.roundedRect(70 + boxWidth, boxY, boxWidth, 80, 8, 8, "FD");

    doc.setFontSize(11);
    doc.setTextColor(168, 85, 247);
    doc.text("Prince Surana", 84 + boxWidth, boxY + 24);
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text("Mobile: +91 8876521045", 84 + boxWidth, boxY + 40);
    doc.text("Email: prince@hansariafood.com", 84 + boxWidth, boxY + 56);

    doc.save(`Sauda_Entries_${dateToShow}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      <Download size={18} />
      <span>PDF</span>
    </button>
  );
};

export default DownloadSaudaEntriesPDF;
