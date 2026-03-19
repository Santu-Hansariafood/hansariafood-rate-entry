import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";


export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allEntries = await SaudaEntry.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sauda Entries");
    const formatSaudaNo = (value) =>
      value ? value.toString().split("-").pop() : "";

    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Company", key: "company", width: 25 },
      { header: "Group", key: "group", width: 20 },
      { header: "Commodity", key: "commodity", width: 20 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Tons", key: "tons", width: 10 },
      { header: "Final Rate", key: "finalRate", width: 15 },
      { header: "Sauda No", key: "saudaNo", width: 15 },
      { header: "Description", key: "description", width: 30 },
    ];

    allEntries.forEach((entry) => {
      const { date, company, saudaEntries } = entry;

      for (const [groupKey, saudaList] of saudaEntries.entries()) {
        saudaList.forEach((item) => {
          worksheet.addRow({
            date,
            company,
            group: groupKey,
            commodity: item.commodity,
            unit: item.unit,
            tons: item.tons,
            finalRate: item.finalRate,
            saudaNo: formatSaudaNo(item.saudaNo),
            description: item.description,
          });
        });
      }
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    const buffer = await workbook.xlsx.writeBuffer();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const today = new Date();
    const formattedDate = `${today.getDate()}_${today.toLocaleString(
      "default",
      {
        month: "short",
      }
    )}_${today.getFullYear()}`;

    const filename = `sauda_entries_${formattedDate}.xlsx`;

    const mailOptions = {
      from: `"Sauda Report" <${process.env.EMAIL_USER}>`,
      to: ["santude1997@gmail.com", "gopal@hansariafood.com"],
      subject: "Daily Sauda Report",
      text: "Please find attached the daily Sauda report in Excel format.",
      attachments: [
        {
          filename: filename,
          content: buffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent with Excel attachment successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error exporting & emailing Excel:", error);
    return NextResponse.json(
      { error: "Failed to export and send Excel" },
      { status: 500 }
    );
  }
}
