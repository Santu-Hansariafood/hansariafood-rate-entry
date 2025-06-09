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

    const existing = await SaudaEntry.findOne({ company, date });

    let entry;

    if (existing) {
      // Update the existing entry
      existing.saudaEntries = saudaEntries;
      await existing.save();
      entry = existing;
    } else {
      // Create a new entry
      entry = new SaudaEntry({ company, date, saudaEntries });
      await entry.save();
    }

    return NextResponse.json(
      { message: "Sauda entry saved successfully", entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /save-sauda:", error);
    return NextResponse.json(
      { error: "Error saving sauda entry" },
      { status: 500 }
    );
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

    let query = {};
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
