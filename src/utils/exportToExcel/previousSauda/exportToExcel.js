import * as XLSX from "xlsx";

export const downloadSaudaExcel = (rows, fileName = "Previous_Sauda.xlsx") => {
  if (!rows || !rows.length) return;

  const excelData = rows.map((row) => ({
    "S.No": row.sl,
    "Buyer Company": row.buyerCompany,
    Consignee: row.consigneeName || row.consignee?.split("-")[0] || "",
    "Sauda No": row.saudaNo,
    Commodity: row.commodity,
    "Delivery Date": row.deliveryDate,
    "Seller Company": row.sellerCompany,
    Tons: row.tons,
    "Final Rate": row.finalRate,
    Status: row.statusText || "Pending",
    Others: row.others,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sauda");

  XLSX.writeFile(workbook, fileName);
};
