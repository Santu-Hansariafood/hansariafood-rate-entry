import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const revalidate = 60;

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const stats = await Rate.aggregate([
      {
        $project: {
          oldDates: {
            $map: {
              input: "$oldRates",
              as: "rate",
              in: "$$rate.date",
            },
          },
          currentDate: "$newRateDate",
        },
      },
      {
        $project: {
          allDates: {
            $concatArrays: [
              { $ifNull: ["$oldDates", []] },
              [{ $ifNull: ["$currentDate", null] }],
            ],
          },
        },
      },
      {
        $unwind: "$allDates",
      },
      {
        $match: {
          allDates: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$allDates" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error in GET /rate/stats:", error);
    return NextResponse.json(
      { error: "Error calculating rate stats" },
      { status: 500 }
    );
  }
}
