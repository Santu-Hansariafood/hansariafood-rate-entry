import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportWeeklyRateToExcel(groupedCompanies, weekDates, userName) {
  const wb = XLSX.utils.book_new();
  const usedSheetNames = new Set();

  groupedCompanies.forEach((company, cIndex) => {
    const companyName =
      company?.name && typeof company.name === "string"
        ? company.name
        : `Company_${cIndex + 1}`;

    (company.locations || []).forEach((location, lIndex) => {
      const rows = [];

      rows.push(["Company Name:", companyName]);
      rows.push(["Location:", location]);
      rows.push(["User:", userName || "User"]);
      rows.push([]);

      rows.push(["Date", "Rate"]);

      weekDates.forEach((date) => {
        const formatted = XLSX.SSF.format("dd-mm-yyyy", date);

        const rate =
          company?.rates?.[location]?.[formatted]?.rate ??
          company?.rates?.[location]?.[formatted] ??
          "";

        rows.push([formatted, rate]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);

      let sheetName = `${companyName}-${location}`.trim();

      sheetName = sheetName.replace(/[:\\/?*\[\]]/g, "");

      sheetName = sheetName.slice(0, 31);

      if (!sheetName) sheetName = `Sheet_${cIndex + 1}_${lIndex + 1}`;

      let originalName = sheetName;
      let counter = 1;
      while (usedSheetNames.has(sheetName)) {
        sheetName = `${originalName}_${counter}`;
        sheetName = sheetName.slice(0, 31);
        counter++;
      }
      usedSheetNames.add(sheetName);

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
  });
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    `Weekly_Rate_Sheet_${userName || "User"}.xlsx`
  );
}
