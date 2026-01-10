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

function drawHeaderFooter(doc, pageWidth, pageHeight, date, time) {
  const logoPath = "/logo/logo1.png";

  doc.addImage(logoPath, "PNG", 40, 25, 110, 38);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text(`Date: ${date}`, pageWidth - 40, 32, { align: "right" });

  doc.setTextColor(220, 38, 38);
  doc.text(`Time: ${time}`, pageWidth - 40, 48, { align: "right" });

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0);
  doc.text("SOYA RATE REPORT", pageWidth / 2, 85, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text("Hansaria Food Private Limited", pageWidth / 2, 102, {
    align: "center",
  });

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1.2);
  doc.line(40, 112, pageWidth - 40, 112);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Confidential — compiled exclusively by Hansaria Food Pvt. Ltd.",
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );
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

  autoTable(doc, {
    startY: 130,
    margin: { left: 40, right: 40, top: 130 },

    head: [columns.map((c) => c.header)],

    body: rows.map((row) =>
      columns.map((c) => {
        let value = extractText(row[c.accessor]);

        if (c.accessor === "company" || c.accessor === "location") {
          const words = value.split(" ");
          if (words.length > 5) {
            value =
              words.slice(0, 5).join(" ") + "\n" + words.slice(5).join(" ");
          }
        }

        const match = value.match(/^(.+?)\s*\(([-+])(\d+)\)$/);
        if (match) {
          return { rate: match[1], diff: `${match[2]}${match[3]}` };
        }

        return { rate: value, diff: null };
      })
    ),

    styles: {
      fontSize: 8,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 18 },
      valign: "middle",
    },

    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },

    theme: "grid",

    didDrawPage() {
      drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
    },

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

  let finalY = doc.lastAutoTable.finalY + 30;

  if (finalY + 140 > pageHeight) {
    doc.addPage();
    drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
    finalY = 130;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text("For Trades, please contact:", pageWidth / 2, finalY, {
    align: "center",
  });

  const boxY = finalY + 12;
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

  doc.save(`Soya_Rate_${dateToShow}_${timeToShow}.pdf`);
}
