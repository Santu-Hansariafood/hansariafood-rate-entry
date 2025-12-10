import { NextResponse } from "next/server";
import RateHistory from "@/models/RateHistory";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    // Get all rate history entries for this company
    const history = await RateHistory.find({ companyId: id });
    return NextResponse.json(history || []);
  } catch (err) {
    console.error("GET /ratehistory error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const body = await req.json();
    const { locationName, commodityName, oldRate, newRate, others } = body;

    if (!locationName || !commodityName) {
      return NextResponse.json({ error: "Location and commodity are required" }, { status: 400 });
    }

    // Convert payload fields to match schema
    const updated = await RateHistory.findOneAndUpdate(
      { companyId: id, location: locationName, commodity: commodityName },
      {
        $set: {
          oldRate: oldRate || 0,
          newRate: newRate || 0,
          others: others || "", // make sure to add 'others' to schema if needed
        },
        $push: {
          history: { date: new Date().toISOString().split("T")[0], rate: newRate },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /ratehistory error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
