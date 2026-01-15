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
  const parts = value.split(" | ");
  const result = [];

  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const regex = /(\d+)\s*(?:\(([+-]?\d+)\))?\s*(?:@\s*(.+))?/i;
    const match = trimmed.match(regex);

    if (match) {
      result.push({
        rate: Number(match[1]),
        diff:
          match[2] !== undefined && match[2] !== null
            ? Number(match[2])
            : null,
        time: match[3]?.trim() || null,
      });
    }
  });

  return result;
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
  doc.addImage("/logo/logo1.png", "PNG", 40, 25, 110, 38);

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Date: ${date}`, pageWidth - 40, 32, { align: "right" });

  doc.setTextColor(37, 99, 235);
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

function getRequiredCellHeight(rates) {
  if (!rates || rates.length === 0) return 26;
  return rates.length * 18 + 10;
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
  const isRateColumn = (accessor) => {
    return !textColumns.includes(accessor);
  };

  autoTable(doc, {
    startY: 130,
    margin: { left: 40, right: 40 },

    head: [columns.map((c) => c.header)],

    body: rows.map((row) =>
      columns.map((c) => {
        if (isRateColumn(c.accessor)) {
          const textAccessor = `${c.accessor}__text`;
          const text = row[textAccessor] ? String(row[textAccessor]) : extractText(row[c.accessor]);
          
          if (text && text !== "-") {
            const rates = parseRates(text);
            return {
              content: "",
              rates,
              isRateColumn: true,
              styles: { minCellHeight: getRequiredCellHeight(rates) },
            };
          } else {
            return {
              content: "-",
              isRateColumn: false,
              styles: { minCellHeight: 26 },
            };
          }
        } else {
          const text = extractText(row[c.accessor]);
          return {
            content: text || "-",
            isRateColumn: false,
            styles: { minCellHeight: 26 },
          };
        }
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

    didDrawPage() {
      drawHeaderFooter(doc, pageWidth, pageHeight, dateToShow, timeToShow);
    },

    didDrawCell(data) {
      if (data.section !== "body") return;

      const cellData = data.cell.raw;

      if (cellData?.isRateColumn && cellData?.rates?.length) {
        const rates = cellData.rates;
        let y = data.cell.y + 14;
        const x = data.cell.x + 6;

        rates.forEach((r, idx) => {
          const label = `# ${idx + 1}`;
          doc.setFontSize(7);
          doc.setTextColor(120);
          doc.text(label, x, y);

          const rateX = x + doc.getTextWidth(label) + 6;
          doc.setFontSize(9);
          doc.setTextColor(0);
          doc.text(String(r.rate), rateX, y);

          let cursorX = rateX + doc.getTextWidth(String(r.rate)) + 8;
          if (r.diff !== null && r.diff !== undefined) {
            const isNegative = r.diff < 0;
            const diffText = `(${r.diff > 0 ? "+" : ""}${r.diff})`;
            doc.setFontSize(8);
            doc.setTextColor(
              isNegative ? 220 : 22,
              isNegative ? 38 : 163,
              isNegative ? 38 : 74
            );
            doc.text(diffText, cursorX, y);
            cursorX += doc.getTextWidth(diffText) + 8;
          }
          if (r.time) {
            doc.setFontSize(7);
            doc.setTextColor(37, 99, 235);
            doc.text(`@ ${r.time}`, cursorX, y);
          }

          y += 18;
        });
      }
    },
  });

  let finalY = doc.lastAutoTable.finalY + 30;

  if (finalY + 120 > pageHeight) {
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

  doc.save(`Soya_Rate_${dateToShow}_${timeToShow}.pdf`);
}
