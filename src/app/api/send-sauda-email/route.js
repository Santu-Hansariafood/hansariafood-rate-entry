import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { generateSaudaExcel } from "@/lib/excel/generateSaudaExcel";
import { sendSaudaEmail } from "@/lib/email/sendSaudaEmail";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";

export async function POST(req) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to } = await req.json();
    if (!to) {
      return NextResponse.json(
        { error: "Missing 'to' email address" },
        { status: 400 },
      );
    }

    const saudaEntries = await SaudaEntry.find({}).lean();

    if (saudaEntries.length === 0) {
      return NextResponse.json(
        { error: "No sauda entries found" },
        { status: 404 },
      );
    }

    const buffer = await generateSaudaExcel(saudaEntries);

    // Delivery happens after the response is flushed so the export stays snappy.
    after(async () => {
      try {
        await sendSaudaEmail({
          to,
          buffer,
          filename: "SaudaReport.xlsx",
        });
      } catch (emailError) {
        console.error("Failed to send sauda report email:", emailError);
      }
    });

    return NextResponse.json(
      { message: "Email queued for delivery" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in POST /send-sauda-email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
