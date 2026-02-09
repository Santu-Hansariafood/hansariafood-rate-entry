import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { generateSaudaExcel } from "@/lib/excel/generateSaudaExcel";
import { sendSaudaEmail } from "@/lib/email/sendSaudaEmail";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";


export async function POST(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to } = await req.json();
    if (!to) {
      return NextResponse.json(
        { error: "Missing 'to' email address" },
        { status: 400 }
      );
    }

    const saudaEntries = await SaudaEntry.find({}).lean();

    if (saudaEntries.length === 0) {
      return NextResponse.json(
        { error: "No sauda entries found" },
        { status: 404 }
      );
    }

    const buffer = await generateSaudaExcel(saudaEntries);

    await sendSaudaEmail({
      to,
      buffer,
      filename: "SaudaReport.xlsx",
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /send-sauda-email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
