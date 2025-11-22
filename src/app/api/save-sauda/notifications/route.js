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
      const { company, date, time, saudaEntries, buyer, seller } = entry;
      if (!saudaEntries) continue;

      for (const [location, items] of Object.entries(saudaEntries)) {
        if (!Array.isArray(items)) continue;

        for (const item of items) {
          const notif = {
            date,
            location: location.split("-")[0].trim(),
            commodity: item.commodity || "",
            tons: item.tons || 0,
            rate: item.finalRate || 0,
            buyerName: buyer || "",
            sellerName: item.sellerName || seller || "",
            sellerCompany: item.sellerCompany || "",
            saudaNo: item.saudaNo || "",
            unit: item.unit || "",
            time: time || "00:00",
            company: company,
            deliveryDate: item.deliveryDate || "",
          };

          if (item.others) {
            notif.others = item.others;
          }

          notifications.push(notif);
        }
      }
    }

    notifications.sort((a, b) =>
      a.time < b.time ? 1 : a.time > b.time ? -1 : 0
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error in GET /api/sauda/notifications:", error);
    return NextResponse.json(
      { error: "Error fetching notifications" },
      { status: 500 }
    );
  }
}
