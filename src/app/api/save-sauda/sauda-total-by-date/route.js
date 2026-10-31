import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { cachedJson, rateLimitGuard } from "@/lib/apiUtils";

export const revalidate = 60;

const getCutoffDate = (months) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  const transitionDate = new Date(2026, 3, 1);
  return d > transitionDate ? d : transitionDate;
};

export async function GET(req) {
  const limited = rateLimitGuard(req, "read");
  if (limited) return limited;

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

    return cachedJson(totals, { maxAge: 60, staleWhileRevalidate: 300 });
  } catch (error) {
    console.error("Error in GET /sauda-total-by-date:", error);
    return NextResponse.json(
      { error: "Error calculating totals by date" },
      { status: 500 },
    );
  }
}
