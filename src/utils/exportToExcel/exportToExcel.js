import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportWeeklyRateToExcel(groupedCompanies, weekDates, userName) {
  const wb = XLSX.utils.book_new();
  const rows = [];
  const merges = [];

  let rowIndex = 0;

  const topDateRow = [
    "",
    ...weekDates.map((d) => XLSX.SSF.format("dd-mm-yy", d)),
  ];
  rows.push(topDateRow);
  rowIndex++;

  rows.push([""]);
  rowIndex++;

  const uniqueCompanies = Array.from(
    new Map(
      groupedCompanies.map((c) => [(c?.name || "").trim().toLowerCase(), c])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  uniqueCompanies.forEach((company, cIndex) => {
    const companyName =
      company?.name && typeof company.name === "string"
        ? company.name
        : `Company_${cIndex + 1}`;

    const uniqueLocations = Array.from(
      new Set((company.locations || []).map((loc) => loc.toString().trim()))
    ).sort((a, b) => a.localeCompare(b));

    rows.push([`${companyName}`]);

    merges.push({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: weekDates.length },
    });

    rowIndex++;

    uniqueLocations.forEach((location) => {
      const rateRow = weekDates.map((date) => {
        const formatted = XLSX.SSF.format("dd-mm-yy", date);
        return (
          company?.rates?.[location]?.[formatted]?.rate ??
          company?.rates?.[location]?.[formatted] ??
          ""
        );
      });

      rows.push([`${location}`, ...rateRow]);
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
        alignment: { horizontal: "left" },
      };
    } else if (value.startsWith("Location:")) {
      cellObj.s = {
        font: { bold: true, sz: 13 },
        alignment: { horizontal: "left" },
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
