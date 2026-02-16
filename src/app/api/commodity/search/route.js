import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";

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

    const escapeRegex = (s) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let pattern = escapeRegex(query);
    pattern = pattern.replace(/\s+/g, "\\s*");

    const filter =
      query.length > 0
        ? {
            name: {
              $regex: pattern,
              $options: "i",
            },
          }
        : {};

    const [commodities, total] = await Promise.all([
      Commodity.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
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
    console.error("GET /commodity/search error:", err);
    return NextResponse.json(
      { error: "Failed to search commodities" },
      { status: 500 }
    );
  }
}
