import { NextResponse } from "next/server";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const date = searchParams.get("date");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const query = {};
    if (company) query.company = company;
    if (date) query.date = date;
    if (fromDate && toDate) {
      query.date = { $gte: fromDate, $lte: toDate };
    }

    const entries = await SaudaEntry.find(query).sort({ date: -1 });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /save-sauda:", error);
    return NextResponse.json(
      { error: "Error fetching sauda entries" },
      { status: 500 },
    );
  }
}
