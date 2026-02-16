import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import RateHistory from "@/models/RateHistory";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const selectedDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const fullHistory = searchParams.get("fullHistory") === "true";

    const docs = await RateHistory.find({ companyId: id }).lean();

    if (fullHistory) {
      return NextResponse.json(docs, { status: 200 });
    }

    const toTime = (value) => {
      if (!value) return 0;
      const date =
        value instanceof Date ? value : new Date(value);
      const time = date.getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const result = docs.map((doc) => {
      const histArr = Array.isArray(doc.history) ? doc.history : [];
      const history = [...histArr].sort(
        (a, b) => toTime(b?.date) - toTime(a?.date)
      );

      const today = history.find((h) => h.date === selectedDate);
      const previous = history.find((h) => h.date < selectedDate);

      return {
        location: doc.location,
        commodity: doc.commodity,
        oldRate: today?.oldRate ?? previous?.finalRate ?? 0,
        tempRates: today?.tempRates || [],
        newRate: today?.finalRate || "",
        others: today?.others || "",
        destinationLocation: today?.destinationLocation || "",
        freightRate: today?.freightRate || 0,
        date: selectedDate,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET ratehistory error:", error);
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
  const { id } = await params;

  try {
    const body = await req.json();
    const {
      locationName,
      commodityName,
      tempRate,
      finalRate,
      note,
      others,
      destinationLocation,
      freightRate,
    } = body;

    if (!locationName || !commodityName) {
      return NextResponse.json(
        { error: "Location & commodity required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toTimeString().slice(0, 5);

    const doc = await RateHistory.findOne({
      companyId: id,
      location: locationName,
      commodity: commodityName,
    });

    let previousRate = 0;

    if (doc) {
      const prev = [...doc.history]
        .filter((h) => h.date < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      previousRate = prev?.finalRate || 0;
    }

    const todayExists = await RateHistory.findOne({
      companyId: id,
      location: locationName,
      commodity: commodityName,
      "history.date": today,
    });

    if (todayExists) {
      const update = {};

      if (tempRate !== undefined) {
        update.$push = {
          "history.$.tempRates": {
            rate: Number(tempRate),
            time,
            note: note || "",
          },
        };

        update.$set = {
          ...(update.$set || {}),
          "history.$.finalRate": Number(tempRate),
        };
      }

      if (finalRate !== undefined) {
        update.$set = {
          ...(update.$set || {}),
          "history.$.finalRate": Number(finalRate),
          "history.$.others": others || "",
          "history.$.destinationLocation": destinationLocation || "",
          "history.$.freightRate": Number(freightRate) || 0,
        };
      } else if (destinationLocation !== undefined || freightRate !== undefined) {
        // Even if finalRate is not provided, update destination and freight if they are
        update.$set = {
          ...(update.$set || {}),
          "history.$.destinationLocation": destinationLocation || "",
          "history.$.freightRate": Number(freightRate) || 0,
        };
      }

      await RateHistory.updateOne(
        {
          companyId: id,
          location: locationName,
          commodity: commodityName,
          "history.date": today,
        },
        update
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
              oldRate: previousRate,
              tempRates:
                tempRate !== undefined
                  ? [
                      {
                        rate: Number(tempRate),
                        time,
                        note: note || "",
                      },
                    ]
                  : [],
              finalRate:
                finalRate !== undefined
                  ? Number(finalRate)
                  : tempRate !== undefined
                  ? Number(tempRate)
                  : null,
              others: others || "",
              destinationLocation: destinationLocation || "",
              freightRate: Number(freightRate) || 0,
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
    console.error("POST ratehistory error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
