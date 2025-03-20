import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";

// Connect to database
await connectDB();

/**
 * @desc Get all companies
 * @route GET /api/companies
 */
export async function GET() {
  try {
    const companies = await Company.find({});
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

/**
 * @desc Create a new company
 * @route POST /api/companies
 */
export async function POST(req) {
  try {
    const { name, category } = await req.json();

    if (!name || !category || name.trim() === "" || category.trim() === "") {
      return NextResponse.json({ error: "Company name and category are required" }, { status: 400 });
    }

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return NextResponse.json({ error: "Company already exists" }, { status: 400 });
    }

    const newCompany = await Company.create({ name, category });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
