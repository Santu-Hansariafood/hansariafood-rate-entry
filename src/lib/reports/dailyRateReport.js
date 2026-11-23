import ExcelJS from "exceljs";
import { connectDB } from "../mongodb.js";
import Rate from "../../models/Rate.js";
import { sendEmail } from "../email/sendEmail.js";
import { generateRateReportEmailTemplate } from "../email/templates/rateReportTemplate.js";

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

// Lets the event loop breathe between batches so incoming requests are not
// blocked while the workbook is built in the same process as the web server.
const yieldToEventLoop = () => new Promise((resolve) => setImmediate(resolve));

const istDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: REPORT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatReportDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: REPORT_TIME_ZONE,
  });

const formatReadableDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: REPORT_TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatReportTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    timeZone: REPORT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// The report only covers rates that were updated today (IST), so we resolve
// the IST day boundaries and treat newRateDate as a UTC-midnight marker.
const getIstTodayRange = (now = new Date()) => {
  const todayStr = istDateFormatter.format(now);
  const start = new Date(`${todayStr}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
};

async function buildReportBuffer(rates, dateLabel) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hansaria Food";
  const worksheet = workbook.addWorksheet("Daily Rates");

  worksheet.columns = [
    { header: "Company", key: "Company", width: 25 },
    { header: "Location", key: "Location", width: 20 },
    { header: "Commodity", key: "Commodity", width: 20 },
    { header: "Mobile", key: "Mobile", width: 15 },
    { header: dateLabel, key: "Rate", width: 15 },
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
    worksheet.addRow({
      Company: capitalizeWords(rate.company),
      Location: rate.location,
      Commodity: rate.commodity || "",
      Mobile: rate.mobile || "",
      Rate: rate.newRate ?? "",
    });

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

    const now = new Date();
    const { start, end } = getIstTodayRange(now);

    const rates = await Rate.find({
      newRateDate: { $gte: start, $lt: end },
    })
      .select("company location commodity mobile newRate newRateDate")
      .lean();

    if (!rates.length) {
      console.log(
        "[daily-rate-report] No rates updated today, nothing to send.",
      );
      return { sent: false, reason: "no-rates-today" };
    }

    const dateLabel = formatReportDate(now);
    const subjectDate = formatReadableDate(now);
    const reportTime = formatReportTime(now);

    const buffer = await buildReportBuffer(rates, dateLabel);

    const stamp = dateLabel.replace(/\//g, "-");
    const filename = `rates-report-${stamp}.xlsx`;

    const html = generateRateReportEmailTemplate({
      company: "Hansaria Food",
      date: subjectDate,
      time: reportTime,
      rates: rates.map((rate) => ({
        company: rate.company,
        location: rate.location,
        commodity: rate.commodity,
        mobile: rate.mobile,
        rate: rate.newRate,
      })),
    });

    await sendEmail({
      to: RECIPIENTS.join(", "),
      subject: `Daily Rate Report - ${subjectDate}`,
      text: `Hello,

Please find attached today's rate report (${dateLabel}) in Excel format. Only rates updated today are included.

Thanks,
Santu De
Hansaria Food Private Limited

*For Verification Goto https://hansariafood.in*

(This is a system-generated email, please do not reply.)`,
      html,
      attachments: [{ filename, content: buffer }],
    });

    console.log(
      `[daily-rate-report] Sent "${filename}" with ${rates.length} rates to ${RECIPIENTS.length} recipients.`,
    );

    return {
      sent: true,
      filename,
      rates: rates.length,
      recipients: RECIPIENTS.length,
    };
  } finally {
    isSendingDailyReport = false;
  }
}
