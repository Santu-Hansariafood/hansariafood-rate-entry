import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";

// Connect to database
await connectDB();

/**
 * @desc Get a single company by ID
 * @route GET /api/companies/:id
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

/**
 * @desc Update a company
 * @route PUT /api/companies/:id
 */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

/**
 * @desc Delete a company
 * @route DELETE /api/companies/:id
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
