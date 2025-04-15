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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const companies = await Company.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Company.countDocuments({});

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
    const { name, category } = await req.json();

    if (!name || !category || name.trim() === "" || category.trim() === "") {
      return NextResponse.json(
        { error: "Company name and category are required" },
        { status: 400 }
      );
    }

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Company already exists" },
        { status: 400 }
      );
    }

    const newCompany = await Company.create({ name, category });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
