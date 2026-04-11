import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const entries = await SaudaEntry.find({ date });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /sauda/get-by-date:", error);
    return NextResponse.json(
      { error: "Error fetching sauda entries" },
      { status: 500 },
    );
  }
}
