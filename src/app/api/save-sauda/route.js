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
    const {
      company,
      date,
      time,
      saudaEntries,
      buyer,
      seller,
      lastUpdated: clientLastUpdated,
    } = await req.json();

    if (
      !company ||
      !date ||
      !saudaEntries ||
      typeof saudaEntries !== "object"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const existingEntry = await SaudaEntry.findOne({ company, date });

    if (
      existingEntry &&
      clientLastUpdated &&
      new Date(clientLastUpdated).getTime() !==
        new Date(existingEntry.lastUpdated).getTime()
    ) {
      return NextResponse.json(
        { conflict: true, message: "Data has changed. Please refresh." },
        { status: 409 }
      );
    }

    const normalizedEntries = {};
    for (const [key, list] of Object.entries(saudaEntries)) {
      if (!Array.isArray(list)) continue;
      normalizedEntries[key] = list.map((entry) => ({
        tons: Number(entry.tons) || 0,
        description: (entry.description || "").trim(),
        others: (entry.others || "").trim(),
        saudaNo: String(entry.saudaNo || "").trim(),
        finalRate: Number(entry.finalRate) || 0,
        unit: (entry.unit || "").trim(),
        commodity: (entry.commodity || "").trim(),
      }));
    }

    const updateData = {
      company: company.trim(),
      date: date.trim(),
      time: time || "",
      saudaEntries: normalizedEntries,
      lastUpdated: new Date(),
    };

    if (buyer) updateData.buyer = buyer.trim();
    if (seller) updateData.seller = seller.trim();

    const updatedEntry = await SaudaEntry.findOneAndUpdate(
      { company, date },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { message: "Sauda entry saved successfully", entry: updatedEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /save-sauda:", error.message);
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
