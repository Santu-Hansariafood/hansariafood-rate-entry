import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DescriptionStats from "@/models/DescriptionStats";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import dayjs from "dayjs";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "15");
    const cutoffDate = dayjs().subtract(days, "day").toDate();

    const recentDocs = await DescriptionStats.find(
      { lastUsedDate: { $gte: cutoffDate } }
    ).select("description").lean();
    
    const recentNames = recentDocs.map(d => d.description);

    const inactiveDescriptions = await DescriptionStats.find({
      description: { $nin: recentNames }
    }).lean();

    const formatted = inactiveDescriptions.map((item) => ({
        description: item.description,
        count: item.count,
        lastUsedDate: item.lastUsedDate,
        totalQuantity: item.totalQuantity,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /description-stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inactive descriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { description, quantity } = body;

    if (!description || quantity == null) {
      return NextResponse.json(
        { error: "Missing description or quantity" },
        { status: 400 }
      );
    }

    const now = new Date();

    await DescriptionStats.findOneAndUpdate(
      { description },
      {
        $inc: {
          count: 1,
          totalQuantity: quantity,
        },
        $set: {
          lastUsedDate: now,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json({ message: "Stats updated" }, { status: 201 });
  } catch (error) {
    console.error("POST /description-stats error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
