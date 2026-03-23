import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, subcommodities } = await req.json();

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

    const formattedSubcommodities = Array.isArray(subcommodities)
      ? subcommodities.map((s) => s?.trim()).filter((s) => s && s.length > 0)
      : [];

    const newCommodity = new Commodity({
      name: trimmedName,
      subcommodities: formattedSubcommodities,
    });

    await newCommodity.save();

    return NextResponse.json(
      {
        message: "Commodity created successfully",
        commodity: newCommodity,
      },
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
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
    const query = searchParams.get("q")?.trim() || "";

    const skip = (page - 1) * limit;

    const filter =
      query.length > 0
        ? {
            name: { $regex: query, $options: "i" },
          }
        : {};

    const [commodities, total] = await Promise.all([
      Commodity.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Commodity.countDocuments(filter),
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
