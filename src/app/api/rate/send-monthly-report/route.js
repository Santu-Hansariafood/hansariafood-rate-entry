const cron = require("node-cron");
const { connectDB } = require("@/lib/mongodb");
const Rate = require("@/models/Rate");
const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

function capitalizeWords(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

async function sendMonthlyReport() {
  await connectDB();

  try {
    const today = new Date();
    const rates = await Rate.find({});

    if (!rates.length) {
      console.log("No rates found");
      return;
    }

    const allDatesSet = new Set();

    rates.forEach((rate) => {
      rate.oldRates.forEach((r) =>
        allDatesSet.add(new Date(r.date).toLocaleDateString("en-GB"))
      );
      if (rate.newRateDate) {
        allDatesSet.add(new Date(rate.newRateDate).toLocaleDateString("en-GB"));
      }
    });

    const sortedDates = Array.from(allDatesSet).sort((a, b) => {
      const [d1, m1, y1] = a.split("/").map(Number);
      const [d2, m2, y2] = b.split("/").map(Number);
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Rates");

    const headers = [
      { header: "Company", key: "Company", width: 25 },
      { header: "Location", key: "Location", width: 20 },
      { header: "Commodity", key: "Commodity", width: 20 },
      { header: "Mobile", key: "Mobile", width: 15 },
      ...sortedDates.map((date) => ({ header: date, key: date, width: 15 })),
    ];

    worksheet.columns = headers;

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    rates
      .sort((a, b) => a.company.localeCompare(b.company))
      .forEach((rate) => {
        const row = {
          Company: capitalizeWords(rate.company),
          Location: rate.location,
          Commodity: rate.commodity || "",
          Mobile: rate.mobile || "",
        };

        if (rate.newRate && rate.newRateDate) {
          const date = new Date(rate.newRateDate).toLocaleDateString("en-GB");
          row[date] = rate.newRate;
        }

        rate.oldRates.forEach((old) => {
          const date = new Date(old.date).toLocaleDateString("en-GB");
          row[date] = old.rate;
        });

        worksheet.addRow(row);
      });

    worksheet.eachRow((row) => {
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
    });

    const filePath = path.join(
      "/tmp",
      `rates-report-${today.getFullYear()}-${today.getMonth() + 1}.xlsx`
    );
    await workbook.xlsx.writeFile(filePath);

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
          filename: `rates-report-${today.getFullYear()}-${
            today.getMonth() + 1
          }.xlsx`,
          path: filePath,
        },
      ],
    });

    fs.unlinkSync(filePath);
    console.log("Monthly rate report sent successfully!");
  } catch (err) {
    console.error("Error sending monthly report:", err);
  }
}

cron.schedule("0 8 1 * *", () => {
  console.log("Running scheduled task: Sending monthly report");
  sendMonthlyReport();
});
