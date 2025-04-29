import cron from "node-cron";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import nodemailer from "nodemailer";
import * as XLSX from "xlsx";
import { writeFileSync, unlinkSync } from "fs";
import path from "path";

async function sendMonthlyReport() {
  await connectDB();
  try {
    const today = new Date();

    const rates = await Rate.find({});
    if (rates.length === 0) return console.log("No rates found");

    const data = rates.map((rate) => ({
      Company: rate.company,
      Location: rate.location,
      Commodity: rate.commodity || "",
      "New Rate": rate.newRate,
      "New Rate Date": rate.newRateDate
        ? new Date(rate.newRateDate).toLocaleDateString("en-GB")
        : "",
      "Old Rates": rate.oldRates
        .map(
          (old) =>
            `${old.rate} (${new Date(old.date).toLocaleDateString("en-GB")})`
        )
        .join(", "),
      Mobile: rate.mobile || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rates");

    const filePath = path.join(
      "/tmp",
      `rates-report-${today.getFullYear()}-${today.getMonth() + 1}.xlsx`
    );
    writeFileSync(
      filePath,
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Rates System" <${process.env.EMAIL_USER}>`,
      to: [
        "gopal@hansariafood.com",
        "info@hansariafood.com",
        "partha.mitra@hansariafood.com",
        "prince@hansariafood.com",
        "santu@hansariafood.com",
      ],
      subject: `Monthly Rate Report - ${today.toLocaleString("default", {
        month: "long",
      })}`,
      text: `Hello,

This is the report of this month in the attached Excel format.

Thanks,
Santu De
Hansaria Food Private Limited

*For Verification Goto https://hansariafood.site*

(This is a system-generated email, please do not reply.)`,
      attachments: [
        {
          filename: `rates-report-${today.getFullYear()}-${today.getMonth() + 1}.xlsx`,
          path: filePath,
        },
      ],
    });

    unlinkSync(filePath);
    console.log("Monthly rate report sent successfully!");
  } catch (error) {
    console.error("Error sending monthly report:", error);
  }
}

// Schedule to run at 8:00 AM on the 1st day of every month
cron.schedule("0 8 1 * *", () => {
  console.log("Running scheduled task: Sending monthly report");
  sendMonthlyReport();
});
