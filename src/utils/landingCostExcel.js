"use client";

import * as XLSX from "xlsx";

export const exportLandingCostToExcel = (
  tableRows,
  selectedCommodity,
  selectedLocation
) => {
  if (!Array.isArray(tableRows) || tableRows.length === 0) {
    return false;
  }

  const header = [
    "Sl No",
    "Company",
    "Commodity",
    "Location",
    "Destination",
    "Base Rate",
    "Freight",
    "Landed",
    "Date",
  ];

  const rows = tableRows.map((row) => [
    row.slno,
    row.companyName,
    row.commodity,
    row.location,
    row.destination || "",
    row.baseRate,
    row.freight,
    row.landed,
    new Date(row.date).toLocaleDateString("en-IN"),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "LandingCost");

  const commodityPart = selectedCommodity
    ? selectedCommodity.replace(/[/\\?%*:|"<>]/g, "_")
    : "all";
  const locationPart = selectedLocation
    ? selectedLocation.replace(/[/\\?%*:|"<>]/g, "_")
    : "all";

  const fileName = `landing_cost_${commodityPart}_${locationPart}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return true;
};

