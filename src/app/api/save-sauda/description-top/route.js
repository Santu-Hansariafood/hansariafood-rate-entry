import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DescriptionStats from "@/models/DescriptionStats";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import dayjs from "dayjs";

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const cutoffDate = dayjs().subtract(days, "day").toDate();

    const total = await DescriptionStats.countDocuments({
      lastUsedDate: { $gte: cutoffDate },
    });

    const topDescriptions = await DescriptionStats.find({
      lastUsedDate: { $gte: cutoffDate },
    })
      .sort({ totalQuantity: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      data: topDescriptions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching top descriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch top descriptions" },
      { status: 500 }
    );
  }
}
