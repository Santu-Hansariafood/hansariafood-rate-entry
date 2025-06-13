import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Commodity name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const trimmedName = name.trim();

    const existing = await Commodity.findOne({ name: trimmedName });

    if (existing) {
      return NextResponse.json(
        { error: "Commodity already exists" },
        { status: 409 }
      );
    }

    const newCommodity = new Commodity({ name: trimmedName });
    await newCommodity.save();

    return NextResponse.json(
      { message: "Commodity created", commodity: newCommodity },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /commodity error:", err);
    return NextResponse.json(
      { error: "Failed to create commodity" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [commodities, total] = await Promise.all([
      Commodity.find().sort({ name: 1 }).skip(skip).limit(limit),
      Commodity.countDocuments(),
    ]);

    return NextResponse.json(
      {
        commodities,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /commodity error:", err);
    return NextResponse.json(
      { error: "Failed to fetch commodities" },
      { status: 500 }
    );
  }
}
