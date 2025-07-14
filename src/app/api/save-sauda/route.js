import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { company, date, saudaEntries } = await req.json();

    if (!company || !date || !saudaEntries) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate each entry to ensure finalRate is a number (optional but good)
    for (const [key, list] of Object.entries(saudaEntries)) {
      saudaEntries[key] = list.map((entry) => ({
        tons: Number(entry.tons) || 0,
        description: entry.description || "",
        saudaNo: String(entry.saudaNo || ""),
        finalRate: Number(entry.finalRate) || 0,
        unit: entry.unit,
        commodity: entry.commodity,
      }));
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const existing = await SaudaEntry.findOne({ company, date });

    let entry;

    if (existing) {
      existing.saudaEntries = saudaEntries;
      existing.time = currentTime;
      await existing.save();
      entry = existing;
    } else {
      entry = new SaudaEntry({
        company,
        date,
        time: currentTime,
        saudaEntries,
      });
      await entry.save();
    }

    return NextResponse.json(
      { message: "Sauda entry saved successfully", entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /save-sauda:", error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const date = searchParams.get("date");

    const query = {};
    if (company) query.company = company;
    if (date) query.date = date;

    const entry = await SaudaEntry.findOne(query);
    return NextResponse.json({ entry }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /save-sauda:", error);
    return NextResponse.json(
      { error: "Error fetching sauda entry" },
      { status: 500 }
    );
  }
}
