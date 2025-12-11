import { NextResponse } from "next/server";
import RateHistory from "@/models/RateHistory";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const history = await RateHistory.find({ companyId: id });
    return NextResponse.json(history || []);
  } catch (err) {
    console.error("GET /ratehistory error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { locationName, commodityName, newRate, others } = body;

    if (!locationName || !commodityName) {
      return NextResponse.json(
        { error: "Location and commodity are required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const existing = await RateHistory.findOne({
      companyId: id,
      location: locationName,
      commodity: commodityName,
    });

    let oldRateToSet = 0;

    if (existing) {
      const lastEntry = existing.history?.[existing.history.length - 1];

      if (lastEntry?.date !== today) {
        oldRateToSet = existing.newRate;
      } else {
        oldRateToSet = existing.oldRate;
      }
    }

    const updated = await RateHistory.findOneAndUpdate(
      {
        companyId: id,
        location: locationName,
        commodity: commodityName,
      },
      {
        $set: {
          oldRate: oldRateToSet,
          newRate: newRate || 0,
          others: others || "",
        },
        $push: {
          history: {
            date: today,
            rate: newRate,
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /ratehistory error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
