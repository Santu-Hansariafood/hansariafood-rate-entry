import ExcelJS from "exceljs";

const toGroupEntries = (value) => {
  if (!value) return [];
  if (value instanceof Map) return [...value.entries()];
  return Object.entries(value);
};

const makeSheetNamer = () => {
  const used = new Set();

  return (name) => {
    const base =
      String(name || "Sheet")
        .replace(/[[\]\\/?*:]/g, "-")
        .trim()
        .slice(0, 31) || "Sheet";

    let candidate = base;
    let suffixIndex = 2;
    while (used.has(candidate.toLowerCase())) {
      const suffix = ` (${suffixIndex++})`;
      candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    }

    used.add(candidate.toLowerCase());
    return candidate;
  };
};

export async function generateSaudaExcel(saudaEntries) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hansaria Food";

  const nextSheetName = makeSheetNamer();

  const grouped = {};
  for (const entry of saudaEntries) {
    if (!grouped[entry.company]) {
      grouped[entry.company] = [];
    }
    grouped[entry.company].push(entry);
  }

  for (const [company, entries] of Object.entries(grouped)) {
    const sheet = workbook.addWorksheet(nextSheetName(company));

    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Time", key: "time", width: 10 },
      { header: "Group", key: "group", width: 15 },
      { header: "SaudaNo", key: "saudaNo", width: 15 },
      { header: "Description", key: "description", width: 25 },
      { header: "Tons", key: "tons", width: 10 },
      { header: "FinalRate", key: "finalRate", width: 15 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Commodity", key: "commodity", width: 15 },
    ];

    for (const e of entries) {
      for (const [group, list] of toGroupEntries(e.saudaEntries)) {
        for (const item of list) {
          sheet.addRow({
            date: e.date,
            time: e.time,
            group,
            saudaNo: item.saudaNo,
            description: item.description,
            tons: item.tons,
            finalRate: item.finalRate,
            unit: item.unit,
            commodity: item.commodity,
          });
        }
      }
    }

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  }

  return workbook.xlsx.writeBuffer();
}
