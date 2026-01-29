export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import Purchase from "@/models/Purchase";

async function initDB() {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}
initDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, unit, commodities, tag } = body;

    if (!date || !unit || !commodities?.length) {
      return NextResponse.json(
        { error: "Date, unit, and commodities are required" },
        { status: 400 }
      );
    }

    const newPurchase = new Purchase({
      date,
      unit,
      commodities,
      tag: tag || "",
    });

    await newPurchase.save();

    return NextResponse.json(
      {
        message: "Purchase created successfully",
        purchase: newPurchase,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /purchases Error:", err);
    return NextResponse.json(
      { error: "Failed to create purchase", detail: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const date = searchParams.get("date") || null;
    const unit = searchParams.get("unit") || null;

    const skip = (page - 1) * limit;

    const query = {};

    if (date) query.date = date;
    if (unit) query.unit = { $regex: unit, $options: "i" };

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Purchase.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        purchases,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /purchases Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch purchases", detail: err.message },
      { status: 500 }
    );
  }
}
