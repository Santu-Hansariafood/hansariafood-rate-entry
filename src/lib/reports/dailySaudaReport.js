import { connectDB } from "../mongodb.js";
import SaudaEntry from "../../models/SaudaEntry.js";
import { sendEmail } from "../email/sendEmail.js";
import { generateSaudaExcel } from "../excel/generateSaudaExcel.js";

const REPORT_TIME_ZONE = "Asia/Kolkata";
const RECIPIENTS = ["gopal@hansariafood.com", "sauda@hansariafood.com"];
let isSendingDailySaudaReport = false;

const formatReportDate = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: REPORT_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const formatFileDate = (date) => {
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const parts = Object.fromEntries(
    dateParts.map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const countSaudas = (entries) =>
  entries.reduce((total, entry) => {
    const groups =
      entry.saudaEntries instanceof Map
        ? [...entry.saudaEntries.values()]
        : Object.values(entry.saudaEntries || {});
    return (
      total +
      groups.reduce(
        (groupTotal, list) =>
          groupTotal + (Array.isArray(list) ? list.length : 0),
        0
      )
    );
  }, 0);

export async function sendDailySaudaReport() {
  if (isSendingDailySaudaReport) {
    console.log("[daily-sauda-report] A report is already being generated.");
    return { sent: false, reason: "already-running" };
  }

  isSendingDailySaudaReport = true;

  try {
    await connectDB();
    const entries = await SaudaEntry.find({})
      .sort({ createdAt: 1 })
      .lean();

    if (countSaudas(entries) === 0) {
      console.log("[daily-sauda-report] No Sauda entries found, nothing to send.");
      return { sent: false, reason: "no-entries" };
    }

    const now = new Date();
    const buffer = await generateSaudaExcel(entries);
    const filename = `total-sauda-${formatFileDate(now)}.xlsx`;
    const reportDate = formatReportDate(now);

    await sendEmail({
      to: RECIPIENTS.join(", "),
      subject: `Daily Total Sauda Report - ${reportDate}`,
      text: `Please find attached the total Sauda Excel report containing all saved Sauda entries as of ${reportDate}.`,
      attachments: [
        {
          filename,
          content: buffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });

    console.log(
      `[daily-sauda-report] Sent "${filename}" to ${RECIPIENTS.join(", ")}.`,
    );
    return { sent: true, filename, recipients: RECIPIENTS.length };
  } finally {
    isSendingDailySaudaReport = false;
  }
}
