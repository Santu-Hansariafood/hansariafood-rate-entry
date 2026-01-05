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

  const logoPath = "/logo/logo1.png";

  doc.addImage(logoPath, "PNG", 40, 20, 120, 40);

  doc.setFontSize(10);
  doc.text(`Date: ${dateToShow}`, pageWidth - 40, 40, {
    align: "right",
  });

  doc.setFontSize(16);
  doc.text("Soya Rate Report", pageWidth / 2, 85, {
    align: "center",
  });

  autoTable(doc, {
    startY: 110,
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
  doc.text("Thanks and Regards,", pageWidth - 40, finalY, {
    align: "right",
  });
  doc.text("Purchase Team", pageWidth - 40, finalY + 16, {
    align: "right",
  });
  doc.text("HANSARIA FOOD PRIVATE LIMITED", pageWidth - 40, finalY + 32, {
    align: "right",
  });

  doc.setFontSize(9);
  doc.text(
    "Confidential — compiled exclusively by the Hansaria Food Team for internal reference.",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" }
  );

  doc.save(`Soya_Rate_${dateToShow}.pdf`);
}
