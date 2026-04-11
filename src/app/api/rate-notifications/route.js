import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RateHistory from "@/models/RateHistory";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const commodityType = searchParams.get("type");

    const today = new Date().toISOString().split("T")[0];

    const query = {
      "history.date": today,
    };

    if (commodityType) {
      if (commodityType === "MDOC") {
        query.commodity = {
          $regex: "(M\\s?DOC|Maize Ddgs Doc)",
          $options: "i",
        };
      } else if (commodityType === "Soya") {
        query.commodity = { $regex: "(SBM|Soya)", $options: "i" };
      } else if (commodityType === "DDGS") {
        query.commodity = { $regex: "DDGS", $options: "i" };
      } else {
        query.commodity = { $regex: commodityType, $options: "i" };
      }
    }

    const histories = await RateHistory.find(query)
      .select({
        companyId: 1,
        location: 1,
        commodity: 1,
        history: { $elemMatch: { date: today } },
      })
      .populate("companyId", "name type")
      .lean();

    const missingIds = histories
      .filter((h) => !h.companyId?.name && h.companyId)
      .map((h) => h.companyId._id || h.companyId);

    let manualMap = {};
    if (missingIds.length > 0) {
      const found = await ManageCompany.find({ _id: { $in: missingIds } })
        .select("name type")
        .lean();
      found.forEach(
        (c) => (manualMap[c._id.toString()] = { name: c.name, type: c.type }),
      );
    }

    let notifications = [];

    histories.forEach((doc) => {
      const todayEntry = doc.history.find((h) => h.date === today);

      if (
        todayEntry &&
        Array.isArray(todayEntry.tempRates) &&
        todayEntry.tempRates.length > 0
      ) {
        let cName = doc.companyId?.name;
        let cType = doc.companyId?.type;
        if (!cName && doc.companyId) {
          const idStr = (doc.companyId._id || doc.companyId).toString();
          cName = manualMap[idStr]?.name;
          cType = manualMap[idStr]?.type;
        }

        todayEntry.tempRates.forEach((rateUpdate) => {
          notifications.push({
            companyName: cName || "Unknown Company",
            companyType: cType || [],
            location: doc.location,
            commodity: doc.commodity,
            rate: rateUpdate.rate,
            updateTime: rateUpdate.time,
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
      { status: 500 },
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
