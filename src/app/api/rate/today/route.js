import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find rates updated today
    const rates = await Rate.find({
      newRateDate: { $gte: today }
    });

    const formattedRates = rates.map((rate) => {
      return {
        company: rate.company,
        location: rate.location,
        commodity: rate.commodity,
        newRate: rate.newRate,
        quantity: rate.quantity || "",
        payment: rate.payment || "",
        others: rate.others || "",
        hasNewRateToday: true,
        lastUpdated: rate.newRateDate,
        updateTime: rate.updateTime || "",
        mobile: rate.mobile || "",
      };
    });

    return NextResponse.json(formattedRates, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/rate/today:", error);
    return NextResponse.json(
      { error: "Error fetching today's rates" },
      { status: 500 }
    );
  }
}
