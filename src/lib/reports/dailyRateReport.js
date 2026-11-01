import ExcelJS from "exceljs";
import { connectDB } from "../mongodb.js";
import Rate from "../../models/Rate.js";
import { sendEmail } from "../email/sendEmail.js";

const REPORT_TIME_ZONE = "Asia/Kolkata";

const RECIPIENTS = [
  "gopal@hansariafood.com",
  "info@hansariafood.com",
  "partha.mitra@hansariafood.com",
  "prince@hansariafood.com",
  "santu@hansariafood.com",
  "sauda@hansariafood.com"
];

const ROW_BATCH_SIZE = 200;

const capitalizeWords = (str) =>
  String(str).toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

// Let the event loop breathe between batches so incoming requests are not
// blocked while the workbook is built in the same process as the web server.
const yieldToEventLoop = () => new Promise((resolve) => setImmediate(resolve));

const formatReportDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: REPORT_TIME_ZONE,
  });

async function buildReportBuffer(rates) {
  const allDates = new Set();

  rates.forEach((rate) => {
    (rate.oldRates || []).forEach((old) => allDates.add(formatReportDate(old.date)));
    if (rate.newRateDate) allDates.add(formatReportDate(rate.newRateDate));
  });

  const sortedDates = Array.from(allDates).sort((a, b) => {
    const [d1, m1, y1] = a.split("/").map(Number);
    const [d2, m2, y2] = b.split("/").map(Number);
    return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hansaria Food";
  const worksheet = workbook.addWorksheet("Daily Rates");

  worksheet.columns = [
    { header: "Company", key: "Company", width: 25 },
    { header: "Location", key: "Location", width: 20 },
    { header: "Commodity", key: "Commodity", width: 20 },
    { header: "Mobile", key: "Mobile", width: 15 },
    ...sortedDates.map((date) => ({ header: date, key: date, width: 15 })),
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const sortedRates = [...rates].sort((a, b) =>
    String(a.company).localeCompare(String(b.company)),
  );

  for (let index = 0; index < sortedRates.length; index += 1) {
    const rate = sortedRates[index];
    const row = {
      Company: capitalizeWords(rate.company),
      Location: rate.location,
      Commodity: rate.commodity || "",
      Mobile: rate.mobile || "",
    };

    sortedDates.forEach((date) => {
      row[date] = "";
    });

    (rate.oldRates || []).forEach((old) => {
      row[formatReportDate(old.date)] = old.rate;
    });

    if (rate.newRate && rate.newRateDate) {
      row[formatReportDate(rate.newRateDate)] = rate.newRate;
    }

    worksheet.addRow(row);

    if ((index + 1) % ROW_BATCH_SIZE === 0) {
      await yieldToEventLoop();
    }
  }

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });

    if (rowNumber % ROW_BATCH_SIZE === 0) {
      await yieldToEventLoop();
    }
  }

  return workbook.xlsx.writeBuffer();
}

let isSendingDailyReport = false;

export async function sendDailyRateReport() {
  if (isSendingDailyReport) {
    console.log(
      "[daily-rate-report] A report is already being generated, skipping this run.",
    );
    return { sent: false, reason: "already-running" };
  }

  isSendingDailyReport = true;

  try {
    await connectDB();

    const rates = await Rate.find({})
      .select("company location commodity mobile oldRates newRate newRateDate")
      .lean();

    if (!rates.length) {
      console.log("[daily-rate-report] No rates found, nothing to send.");
      return { sent: false, reason: "no-rates" };
    }

    const today = new Date();
    const buffer = await buildReportBuffer(rates);

    const stamp = formatReportDate(today).replace(/\//g, "-");
    const filename = `rates-report-${stamp}.xlsx`;

    await sendEmail({
      to: RECIPIENTS.join(", "),
      subject: `Daily Rate Report - ${today.toLocaleDateString("en-GB", {
        timeZone: REPORT_TIME_ZONE,
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      text: `Hello,

This is the daily rate report in Excel format.

Thanks,
Santu De
Hansaria Food Private Limited

*For Verification Goto https://hansariafood.in*

(This is a system-generated email, please do not reply.)`,
      attachments: [{ filename, content: buffer }],
    });

    console.log(
      `[daily-rate-report] Sent "${filename}" to ${RECIPIENTS.length} recipients.`,
    );

    return { sent: true, filename, recipients: RECIPIENTS.length };
  } finally {
    isSendingDailyReport = false;
  }
}
