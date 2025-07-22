import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
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

    const searchRegex = new RegExp(search, "i");
    const query = search ? { name: { $regex: searchRegex } } : {};

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Company.countDocuments(query),
    ]);

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, category, type } = await req.json();

    if (
      !name?.trim() ||
      !category?.trim() ||
      !type?.trim() ||
      !["buyer", "seller"].includes(type.toLowerCase())
    ) {
      return NextResponse.json(
        { error: "Name, category, and valid type are required" },
        { status: 400 }
      );
    }

    const existingCompany = await Company.findOne({
      name: name.trim(),
      type: type.toLowerCase(),
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this name and type already exists" },
        { status: 400 }
      );
    }

    const newCompany = await Company.create({
      name: name.trim(),
      category: category.trim(),
      type: type.toLowerCase(),
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Company with this name and type already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
