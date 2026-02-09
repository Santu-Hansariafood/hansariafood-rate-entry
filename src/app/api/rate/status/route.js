import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ratesToday = await Rate.find({
      newRateDate: { $gte: today },
    }).select("company commodity -_id").lean();

    return NextResponse.json(ratesToday, { status: 200 });
  } catch (error) {
    console.error("Error in GET /rate/status:", error);
    return NextResponse.json(
      { error: "Error fetching rate status" },
      { status: 500 }
    );
  }
}
