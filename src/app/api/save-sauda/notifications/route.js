import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

function getTodayString() {
  const today = new Date();
  return `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const todayString = getTodayString();

    const entries = await SaudaEntry.find({ date: todayString })
      .sort({ createdAt: -1 })
      .lean();

    const notifications = [];

    for (const entry of entries) {
      const { company, date, time, saudaEntries } = entry;
      if (!saudaEntries) continue;

      for (const [location, items] of Object.entries(saudaEntries)) {
        if (!Array.isArray(items)) continue;

        for (const item of items) {
          notifications.push({
            company,
            date,
            location: location.split("-")[0].trim(),
            commodity: item.commodity || "",
            tons: item.tons || 0,
            rate: item.newRate || null,
            buyerName: item.buyerName || "",
            sellerName: item.sellerName || "",
            saudaNo: item.saudaNo || "",
            description: item.description || "",
            unit: item.unit || "",
            time: time || "00:00",
          });
        }
      }
    }

    notifications.sort((a, b) => {
      if (a.time < b.time) return 1;
      if (a.time > b.time) return -1;
      return 0;
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error in GET /api/sauda/notifications:", error);
    return NextResponse.json(
      { error: "Error fetching notifications" },
      { status: 500 }
    );
  }
}
