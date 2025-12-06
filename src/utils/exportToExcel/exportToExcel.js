import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportWeeklyRateToExcel(groupedCompanies, weekDates, userName) {
  const wb = XLSX.utils.book_new();
  const rows = [];
  const merges = [];

  let rowIndex = 0;

  groupedCompanies.forEach((company, cIndex) => {
    const companyName =
      company?.name && typeof company.name === "string"
        ? company.name
        : `Company_${cIndex + 1}`;

    rows.push([`Company: ${companyName}`]);

    merges.push({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: weekDates.length },
    });

    rowIndex++;

    rows.push([""]);
    rowIndex++;

    (company.locations || []).forEach((location) => {
      rows.push([`Location: ${location}`]);

      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: weekDates.length },
      });

      rowIndex++;

      const dateRow = weekDates.map((date) =>
        XLSX.SSF.format("dd-mm-yyyy", date)
      );
      rows.push(dateRow);
      rowIndex++;

      const rateRow = weekDates.map((date) => {
        const formatted = XLSX.SSF.format("dd-mm-yyyy", date);

        return (
          company?.rates?.[location]?.[formatted]?.rate ??
          company?.rates?.[location]?.[formatted] ??
          ""
        );
      });

      rows.push(rateRow);
      rowIndex++;

      rows.push([""]);
      rowIndex++;
    });

    rows.push([""]);
    rowIndex++;
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;

  Object.keys(ws).forEach((cell) => {
    if (cell[0] === "!") return;

    const cellObj = ws[cell];
    const value = cellObj.v?.toString() || "";

    if (value.startsWith("Company:")) {
      cellObj.s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: "center" },
      };
    } else if (value.startsWith("Location:")) {
      cellObj.s = {
        font: { bold: true, sz: 13 },
        alignment: { horizontal: "center" },
      };
    } else if (/\d{2}-\d{2}-\d{4}/.test(value)) {
      cellObj.s = {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center" },
      };
    } else if (!isNaN(parseFloat(value))) {
      cellObj.s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
      };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "Weekly Rates");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    `Weekly_Rate_Sheet_${userName || "User"}.xlsx`
  );
}
