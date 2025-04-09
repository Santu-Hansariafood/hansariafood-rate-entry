import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";

// Ensure database connection
await connectDB();

/**
 * @desc Get all companies
 * @route GET /api/companies
 */
export async function GET(req) {
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

/**
 * @desc Create a new company
 * @route POST /api/companies
 */
export async function POST(req) {
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

/**
 * @desc Get, update, or delete a single company by ID
 * @route GET, PUT, DELETE /api/companies/[id]
 */
export async function GET_BY_ID(req, { params }) {
  try {
    const { id } = params;
    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { name, category } = await req.json();

    if (!name || !category || name.trim() === "" || category.trim() === "") {
      return NextResponse.json(
        { error: "Company name and category are required" },
        { status: 400 }
      );
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { name, category },
      { new: true }
    );

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
