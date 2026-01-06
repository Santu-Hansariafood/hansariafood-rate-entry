import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function exportToExcel(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Soya Rates");
  XLSX.writeFile(workbook, "soya_rates.xlsx");
}

export function exportToPDF(rows, columns, selectedDate) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "A4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const dateToShow = selectedDate || new Date().toISOString().split("T")[0];
  const timeToShow = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const logoPath = "/logo/logo1.png";

  doc.addImage(logoPath, "PNG", 40, 20, 120, 40);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Date: ${dateToShow}`, pageWidth - 40, 35, { align: "right" });

  doc.setTextColor(220, 38, 38);
  doc.text(`Time: ${timeToShow}`, pageWidth - 40, 50, { align: "right" });

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Soya Rate Report", pageWidth / 2, 90, {
    align: "center",
  });

  autoTable(doc, {
    startY: 120,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => row[c.accessor] ?? "-")),
    styles: {
      fontSize: 8,
      cellPadding: 5,
      halign: "center",
    },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
    margin: { left: 40, right: 40 },
  });

  const finalY = doc.lastAutoTable.finalY + 30;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Thanks and Regards,", pageWidth - 40, finalY, {
    align: "right",
  });
  doc.text("Purchase Team", pageWidth - 40, finalY + 16, {
    align: "right",
  });
  doc.text("HANSARIA FOOD PRIVATE LIMITED", pageWidth - 40, finalY + 32, {
    align: "right",
  });

  const contactY = finalY + 60;

  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text("For Trades, please contact:", pageWidth / 2, contactY, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text("Gopal Agarwal", 60, contactY + 24);
  doc.setFontSize(9);
  doc.text("Mobile: +91 9830433535", 60, contactY + 40);
  doc.text("Email: gopal@hansariafood.com", 60, contactY + 54);
  doc.text("Kolkata Office", 60, contactY + 68);
  doc.setFontSize(11);
  doc.setTextColor(168, 85, 247);
  doc.text("Prince Surana", pageWidth - 60, contactY + 24, {
    align: "right",
  });
  doc.setFontSize(9);
  doc.text("Mobile: +91 8876521045", pageWidth - 60, contactY + 40, {
    align: "right",
  });
  doc.text("Email: prince@hansariafood.com", pageWidth - 60, contactY + 54, {
    align: "right",
  });
  doc.text("Assam Office", pageWidth - 60, contactY + 68, {
    align: "right",
  });

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Confidential — compiled exclusively by the Hansaria Food Team for internal reference.",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" }
  );

  doc.save(`Soya_Rate_${dateToShow}.pdf`);
}
