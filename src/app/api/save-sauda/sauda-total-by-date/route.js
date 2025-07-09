import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allEntries = await SaudaEntry.find({});

    // Map to hold date => totalTons
    const dateTotals = new Map();

    for (const entry of allEntries) {
      let entryTotalTons = 0;

      for (const entriesArray of entry.saudaEntries.values()) {
        for (const item of entriesArray) {
          entryTotalTons += item.tons;
        }
      }

      // Add to running total for this date
      if (dateTotals.has(entry.date)) {
        dateTotals.set(entry.date, dateTotals.get(entry.date) + entryTotalTons);
      } else {
        dateTotals.set(entry.date, entryTotalTons);
      }
    }

    // Convert Map to array for JSON response
    const result = Array.from(dateTotals.entries()).map(([date, totalTons]) => ({
      date,
      totalTons,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in GET /sauda-total-by-date:", error);
    return NextResponse.json(
      { error: "Error calculating totals by date" },
      { status: 500 }
    );
  }
}
