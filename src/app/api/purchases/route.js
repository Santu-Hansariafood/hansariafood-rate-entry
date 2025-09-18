import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import Purchase from "@/models/Purchase";

await connectDB();

// ✅ Create purchase
export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { date, unit, commodities, tag } = await req.json();
    if (!date || !unit || !commodities?.length) {
      return NextResponse.json(
        { error: "Date, unit, and commodities are required" },
        { status: 400 }
      );
    }

    const newPurchase = new Purchase({ date, unit, commodities, tag });
    await newPurchase.save();

    return NextResponse.json(
      { message: "Purchase created successfully", purchase: newPurchase },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}

// ✅ Get all purchases with pagination + filters
export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const date = searchParams.get("date")?.trim();
    const unit = searchParams.get("unit")?.trim();
    const skip = (page - 1) * limit;

    const query = {};
    if (date) query.date = date;
    if (unit) query.unit = { $regex: unit, $options: "i" };

    const [purchases, total] = await Promise.all([
      Purchase.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Purchase.countDocuments(query),
    ]);

    return NextResponse.json(
      { purchases, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}
