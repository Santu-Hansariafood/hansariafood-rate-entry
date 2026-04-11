import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const revalidate = 60;

const getCutoffDate = (months) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
};

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const totals = await SaudaEntry.aggregate([
      {
        $match: {
          createdAt: { $gte: getCutoffDate(12) },
        },
      },
      {
        $project: {
          date: 1,
          saudaEntries: { $objectToArray: "$saudaEntries" },
        },
      },
      { $unwind: "$saudaEntries" },
      { $unwind: "$saudaEntries.v" },
      {
        $group: {
          _id: "$date",
          totalTons: { $sum: "$saudaEntries.v.tons" },
        },
      },

      {
        $project: {
          _id: 0,
          date: "$_id",
          totalTons: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return NextResponse.json(totals, { status: 200 });
  } catch (error) {
    console.error("Error in GET /sauda-total-by-date:", error);
    return NextResponse.json(
      { error: "Error calculating totals by date" },
      { status: 500 },
    );
  }
}
