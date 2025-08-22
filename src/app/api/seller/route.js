import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Seller from "@/models/Seller";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // ✅ Search in both sellerName and companies array
    const searchRegex = new RegExp(search, "i");
    const query = search
      ? {
          $or: [
            { sellerName: { $regex: searchRegex } },
            { companies: { $elemMatch: { $regex: searchRegex } } },
          ],
        }
      : {};

    const [sellers, total] = await Promise.all([
      Seller.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Seller.countDocuments(query),
    ]);

    return NextResponse.json({ sellers, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sellers", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sellerName, companies } = await req.json();

    const sellerNameTrimmed = sellerName?.trim();
    if (!sellerNameTrimmed) {
      return NextResponse.json(
        { error: "Seller name is required" },
        { status: 400 }
      );
    }

    if (!companies || !Array.isArray(companies) || companies.some((c) => !c.trim())) {
      return NextResponse.json(
        { error: "All company names are required" },
        { status: 400 }
      );
    }

    // ✅ Check for existing seller
    const existingSeller = await Seller.findOne({ sellerName: sellerNameTrimmed });
    if (existingSeller) {
      return NextResponse.json(
        { error: "Seller name already exists" },
        { status: 400 }
      );
    }

    const newSeller = await Seller.create({
      sellerName: sellerNameTrimmed,
      companies: companies.map((c) => c.trim()),
    });

    return NextResponse.json(
      { message: "Seller created", createdSeller: newSeller },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Seller name must be unique" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create seller", details: error.message },
      { status: 500 }
    );
  }
}
