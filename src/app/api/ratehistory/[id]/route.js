import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import RateHistory from "@/models/RateHistory";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = params;

  try {
    const today = new Date().toISOString().split("T")[0];
    const docs = await RateHistory.find({ companyId: id });

    const result = [];

    for (const doc of docs) {
      const sorted = [...(doc.history || [])].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const todayEntry = sorted.find((h) => h.date === today);
      const previousEntry = sorted.find((h) => h.date < today);

      const visibleEntry = todayEntry || previousEntry;

      result.push({
        location: doc.location,
        commodity: doc.commodity,
        newRate: todayEntry ? todayEntry.rate : "",
        oldRate: previousEntry ? previousEntry.rate : "",
        others: visibleEntry?.others || "",
        date: visibleEntry?.date || today,
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET /ratehistory error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = params;

  try {
    const body = await req.json();
    const { locationName, commodityName, newRate, others } = body;

    if (!locationName || !commodityName) {
      return NextResponse.json(
        { error: "Location and commodity are required" },
        { status: 400 }
      );
    }

    const rateValue = Number(newRate);
    if (isNaN(rateValue)) {
      return NextResponse.json(
        { error: "Invalid rate value" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const existsToday = await RateHistory.findOne({
      companyId: id,
      location: locationName,
      commodity: commodityName,
      "history.date": today,
    });

    // 🔁 SAME DAY → UPDATE
    if (existsToday) {
      await RateHistory.updateOne(
        {
          companyId: id,
          location: locationName,
          commodity: commodityName,
          "history.date": today,
        },
        {
          $set: {
            "history.$.rate": rateValue,
            "history.$.others": others || "",
          },
        }
      );
    } else {
      await RateHistory.findOneAndUpdate(
        {
          companyId: id,
          location: locationName,
          commodity: commodityName,
        },
        {
          $push: {
            history: {
              date: today,
              rate: rateValue,
              others: others || "",
            },
          },
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(
      { success: true, message: "Rate updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /ratehistory error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
