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
    const { company, date, time, saudaEntries } = await req.json();

    if (!company || !date || !saudaEntries) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    for (const [key, list] of Object.entries(saudaEntries)) {
      saudaEntries[key] = list.map((entry) => ({
        tons: Number(entry.tons) || 0,
        description: entry.description || "",
        others: entry.others || "",
        saudaNo: String(entry.saudaNo || ""),
        finalRate: Number(entry.finalRate) || 0,
        unit: entry.unit,
        commodity: entry.commodity,
      }));
    }

    const updatedEntry = await SaudaEntry.findOneAndUpdate(
      { company, date },
      {
        $set: {
          saudaEntries,
          time: time || "",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json(
      { message: "Sauda entry saved successfully", entry: updatedEntry },
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
