import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function extractText(value) {
  if (value === null || value === undefined) return "-";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object" && value.props) {
    const children = value.props.children;
    if (Array.isArray(children)) {
      return children.map(extractText).join("");
    }
    return extractText(children);
  }

  return "-";
}

export function exportToExcel(rows) {
  const excelRows = rows.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      newRow[key] = extractText(row[key]);
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
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

  const fileTime = timeToShow.replace(/[:\s]/g, "_");
  const logoPath = "/logo/logo1.png";

  doc.addImage(logoPath, "PNG", 40, 20, 120, 40);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${dateToShow}`, pageWidth - 40, 35, { align: "right" });

  doc.setTextColor(220, 38, 38);
  doc.text(`Time: ${timeToShow}`, pageWidth - 40, 50, { align: "right" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Soya Rate Report", pageWidth / 2, 90, { align: "center" });

  autoTable(doc, {
    startY: 120,
    head: [columns.map((c) => c.header)],

    body: rows.map((row) =>
      columns.map((c) => {
        let value = extractText(row[c.accessor]);

        if (c.accessor === "company") {
          const words = value.split(" ");
          if (value.includes("-") || words.length >= 5) {
            value =
              words.slice(0, 4).join(" ") + "\n" + words.slice(4).join(" ");
          }
        }

        if (c.accessor === "location") {
          const words = value.split(" ");
          if (words.length > 5) {
            value =
              words.slice(0, 5).join(" ") + "\n" + words.slice(5).join(" ");
          }
        }

        const match = value.match(/^(.+?)\s*\(([-+])(\d+)\)$/);

        if (match) {
          return {
            rate: match[1],
            diff: `${match[2]}${match[3]}`,
          };
        }

        return { rate: value, diff: null };
      })
    ),

    styles: {
      fontSize: 8,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 18 }, // 🔥 reserve space
      valign: "middle",
      textColor: 0,
    },

    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      0: { halign: "left" },
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "left" },
      4: { halign: "left" },
      5: { halign: "left" },
      6: { halign: "left" },
      7: { halign: "left" },
    },

    theme: "grid",
    margin: { left: 40, right: 40 },

    didParseCell(data) {
      if (data.cell.raw?.rate) {
        data.cell.text = [String(data.cell.raw.rate)];
      }
    },

    didDrawCell(data) {
      const raw = data.cell.raw;
      if (!raw?.diff) return;

      const isPositive = raw.diff.startsWith("+");

      doc.setFontSize(8);
      doc.setTextColor(
        isPositive ? 22 : 220,
        isPositive ? 163 : 38,
        isPositive ? 74 : 38
      );

      const x = data.cell.x + data.cell.width - 6;
      const y = data.cell.y + data.cell.height / 2 + 3;

      doc.text(`(${raw.diff})`, x, y, { align: "right" });
    },
  });

  const finalY = doc.lastAutoTable.finalY + 30;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Thanks and Regards,", pageWidth - 40, finalY, { align: "right" });
  doc.text("Purchase Team", pageWidth - 40, finalY + 16, { align: "right" });
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

  doc.save(`Soya_Rate_${dateToShow}_${fileTime}.pdf`);
}
