import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Seller from "@/models/Seller";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(search, "i");
    const query = search
      ? {
          $or: [
            { sellerName: { $regex: searchRegex } },
            { companies: { $regex: searchRegex } },
            { "companies.name": { $regex: searchRegex } },
          ],
        }
      : {};

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .select("sellerName companies createdAt")
        .sort({ sellerName: 1, createdAt: -1 })
        .collation({ locale: "en", strength: 2 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Seller.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      { sellers, total, currentPage: page, totalPages, pageSize: limit },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sellers", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sellerName, companies } = await req.json();

    const sellerNameTrimmed = sellerName?.trim();
    if (!sellerNameTrimmed) {
      return NextResponse.json(
        { error: "Seller name is required" },
        { status: 400 },
      );
    }

    if (
      !companies ||
      !Array.isArray(companies) ||
      companies.some((c) => !c.trim())
    ) {
      return NextResponse.json(
        { error: "All company names are required" },
        { status: 400 },
      );
    }

    const existingSeller = await Seller.findOne({
      sellerName: sellerNameTrimmed,
    }).lean();
    if (existingSeller) {
      return NextResponse.json(
        { error: "Seller name already exists" },
        { status: 400 },
      );
    }

    const newSeller = await Seller.create({
      sellerName: sellerNameTrimmed,
      companies: companies.map((c) => c.trim()),
    });

    return NextResponse.json(
      { message: "Seller created", createdSeller: newSeller },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Seller name must be unique" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create seller", details: error.message },
      { status: 500 },
    );
  }
}
