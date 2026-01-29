import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RateHistory from "@/models/RateHistory";
import Company from "@/models/Company";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const commodityType = searchParams.get("type");

    const today = new Date().toISOString().split("T")[0];

    const query = {
      "history.date": today,
    };

    if (commodityType) {
      query.commodity = { $regex: commodityType, $options: "i" };
    }

    const histories = await RateHistory.find(query).populate(
      "companyId",
      "name"
    );

    let notifications = [];

    histories.forEach((doc) => {
      const todayEntry = doc.history.find((h) => h.date === today);

      if (
        todayEntry &&
        Array.isArray(todayEntry.tempRates) &&
        todayEntry.tempRates.length > 0
      ) {
        todayEntry.tempRates.forEach((rateUpdate) => {
          notifications.push({
            companyName: doc.companyId?.name || "Unknown Company",
            location: doc.location,
            commodity: doc.commodity,
            rate: rateUpdate.rate,
            time: rateUpdate.time,
            date: todayEntry.date,
            timestamp: buildTimestamp(todayEntry.date, rateUpdate.time),
          });
        });
      }
    });

    notifications.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching rate notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function buildTimestamp(dateStr, timeStr) {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);

    let [time, modifier] = (timeStr || "").split(" ");
    let [hours, minutes] = (time || "00:00").split(":").map(Number);

    if (!isNaN(hours) && modifier) {
      modifier = modifier.toLowerCase();
      if (hours === 12) {
        hours = modifier === "pm" ? 12 : 0;
      } else if (modifier === "pm") {
        hours += 12;
      }
    }

    return new Date(year, month - 1, day, hours || 0, minutes || 0).getTime();
  } catch (e) {
    return 0;
  }
}
