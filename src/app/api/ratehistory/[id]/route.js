import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import RateHistory from "@/models/RateHistory";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, context) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await context.params;

  try {
    const today = new Date().toISOString().split("T")[0];
    const docs = await RateHistory.find({ companyId: id });

    const result = [];

    for (const doc of docs) {
      const history = doc.history || [];

      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const todayEntry = sortedHistory.find((h) => h.date === today);

      const previousEntry = sortedHistory.find((h) => h.date < today);

      const visibleEntry = todayEntry || previousEntry;

      result.push({
        location: doc.location,
        commodity: doc.commodity,
        newRate: todayEntry ? todayEntry.rate : "",
        oldRate: previousEntry ? previousEntry.rate : 0,
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

export async function POST(req, context) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const existsToday = await RateHistory.findOne({
      companyId: id,
      location: locationName,
      commodity: commodityName,
      "history.date": today,
    });

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
            "history.$.rate": Number(newRate),
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
              rate: Number(newRate),
              others: others || "",
            },
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /ratehistory error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
