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

    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset);
    
    const startOfDayIST = new Date(istTime);
    startOfDayIST.setUTCHours(0, 0, 0, 0);
    
    // Convert back to UTC for query
    const startOfDayUTC = new Date(startOfDayIST.getTime() - istOffset);

    const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Find rates updated today in IST
    const rates = await Rate.find({
      newRateDate: { 
        $gte: startOfDayUTC,
        $lte: endOfDayUTC
      }
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
