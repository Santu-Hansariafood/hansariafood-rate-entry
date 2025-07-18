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
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "15");

    const cutoffDate = dayjs().subtract(days, "day").toDate();

    const recent = await DescriptionStats.find({
      lastUsedDate: { $gte: cutoffDate },
    });

    const recentDescriptions = new Set(recent.map((r) => r.description));

    const all = await DescriptionStats.find();

    const inactiveDescriptions = all
      .filter((item) => !recentDescriptions.has(item.description))
      .map((item) => ({
        description: item.description,
        count: item.count,
        lastUsedDate: item.lastUsedDate,
        totalQuantity: item.totalQuantity,
      }));

    return NextResponse.json(inactiveDescriptions);
  } catch (error) {
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
    const body = await req.json();
    const { description, quantity } = body;

    if (!description || quantity == null) {
      return NextResponse.json(
        { error: "Missing description or quantity" },
        { status: 400 }
      );
    }

    const now = new Date();

    const existing = await DescriptionStats.findOne({ description });

    if (existing) {
      existing.count += 1;
      existing.lastUsedDate = now;
      existing.totalQuantity += quantity;
      await existing.save();
    } else {
      const newEntry = new DescriptionStats({
        description,
        count: 1,
        lastUsedDate: now,
        totalQuantity: quantity,
      });
      await newEntry.save();
    }

    return NextResponse.json({ message: "Stats updated" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
