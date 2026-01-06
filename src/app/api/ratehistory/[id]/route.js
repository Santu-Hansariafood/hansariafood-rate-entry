import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import RateHistory from "@/models/RateHistory";
import ManageCompany from "@/models/ManageCompany";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = params;

  try {
    const company = await ManageCompany.findById(id)
      .select("isSoyaVisible")
      .lean();

    if (!company || company.isSoyaVisible !== true) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const selectedDate =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    const docs = await RateHistory.find({ companyId: id }).lean();
    const result = [];

    for (const doc of docs) {
      const history = doc.history || [];

      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const sameDayEntry = sortedHistory.find((h) => h.date === selectedDate);

      const previousEntry = sortedHistory.find((h) => h.date < selectedDate);

      const visibleEntry = sameDayEntry || previousEntry;

      result.push({
        location: doc.location,
        commodity: doc.commodity,
        newRate: sameDayEntry ? sameDayEntry.rate : "",
        oldRate: previousEntry ? previousEntry.rate : "",
        others: visibleEntry?.others || "",
        date: visibleEntry?.date || selectedDate,
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /ratehistory error:", error);
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
  } catch (error) {
    console.error("POST /ratehistory error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
