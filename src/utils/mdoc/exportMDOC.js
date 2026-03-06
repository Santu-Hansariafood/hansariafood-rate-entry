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
    if (Array.isArray(children)) return children.map(extractText).join("");
    return extractText(children);
  }

  return "-";
}

function parseRates(value) {
  if (!value || value === "-") return [];

  return value
    .split(" | ")
    .map((part) => {
      const match = part
        .trim()
        .match(/(\d+)\s*(?:\(([+-]?\d+)\))?\s*(?:@\s*(.+))?/);
      if (!match) return null;

      return {
        rate: Number(match[1]),
        diff: match[2] ? Number(match[2]) : null,
        time: match[3]?.trim() || null,
      };
    })
    .filter(Boolean);
}

function getRequiredCellHeight(rates) {
  return Math.max(26, rates.length * 18 + 8);
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

  XLSX.utils.book_append_sheet(workbook, worksheet, "MDOC Rates");
  XLSX.writeFile(workbook, "mdoc_rates.xlsx");
}

function drawHeaderFooter(doc, pageWidth, pageHeight, date, time) {
  doc.addImage("/logo/logo1.png", "PNG", 40, 25, 110, 38);

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Date: ${date}`, pageWidth - 40, 32, { align: "right" });

  doc.setTextColor(37, 99, 235);
  doc.text(`Time: ${time}`, pageWidth - 40, 48, { align: "right" });

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0);
  doc.text("M DOC & Maize Ddgs Doc RATE REPORT", pageWidth / 2, 85, { align: "center" });

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

  const textColumns = ["sl", "company", "location"];
  const isRateColumn = (accessor) => !textColumns.includes(accessor);

  autoTable(doc, {
    startY: 140,
    margin: { top: 140, left: 40, right: 40 },

    pageBreak: "auto",
    rowPageBreak: "avoid",

    head: [columns.map((c) => c.header)],

    body: rows.map((row) =>
      columns.map((c) => {
        if (isRateColumn(c.accessor)) {
          const text = row[`${c.accessor}__text`]
            ? String(row[`${c.accessor}__text`])
            : extractText(row[c.accessor]);

          const rates = parseRates(text);

          return {
            content: rates.length ? "" : "-",
            rates,
            isRateColumn: true,
            styles: { minCellHeight: getRequiredCellHeight(rates) },
          };
        }

        return {
          content: extractText(row[c.accessor]),
          styles: {
            minCellHeight: 26,
            overflow: "linebreak",
            maxLines: c.accessor === "company" ? 2 : 1,
          },
        };
      })
    ),

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 6,
      valign: "top",
    },

    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 150 },
      2: { cellWidth: 90 },
    },

    didDrawPage() {
      drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
    },

    didDrawCell(data) {
      if (data.section !== "body") return;

      const cell = data.cell.raw;
      if (!cell?.isRateColumn || !cell?.rates?.length) return;

      let y = data.cell.y + 16;
      const startX = data.cell.x + 8;

      cell.rates.forEach((r, i) => {
        doc.setFontSize(9);
        doc.setTextColor(0);
        const rateText = String(r.rate);
        doc.text(rateText, startX, y);

        let cursorX = startX + doc.getTextWidth(rateText) + 6;

        if (r.diff !== null) {
          const diffText = `(${r.diff > 0 ? "+" : ""}${r.diff})`;

          doc.setFontSize(8);
          doc.setTextColor(
            r.diff < 0 ? 220 : 22,
            r.diff < 0 ? 38 : 163,
            r.diff < 0 ? 38 : 74
          );

          doc.text(diffText, cursorX, y);
          cursorX += doc.getTextWidth(diffText) + 4;
        }

        if (i !== cell.rates.length - 1) {
          doc.setDrawColor(220);
          doc.setLineWidth(0.5);
          doc.line(
            data.cell.x + 4,
            y + 7,
            data.cell.x + data.cell.width - 4,
            y + 7
          );
        }

        y += 18;
      });
    },
  });

  let finalY = doc.lastAutoTable.finalY + 30;

  if (finalY + 120 > pageHeight) {
    doc.addPage();
    drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow);
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

  doc.save(`MDOC_Rate_${dateToShow}_${timeToShow}.pdf`);
}

