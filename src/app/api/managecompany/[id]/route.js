import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req, { params }) {
  await connectDB();

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch company", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const id = params.id;
    const {
      name,
      location,
      state,
      category,
      commodities,
      subCommodities = [],
      mobileNumbers = [],
      type,
      isSelfCompany,
    } = await req.json();

    if (
      !name ||
      !Array.isArray(location) ||
      location.length === 0 ||
      !Array.isArray(type) ||
      type.length === 0 ||
      !type.every((t) => ["buyer", "seller"].includes(t.toLowerCase()))
    ) {
      return NextResponse.json(
        {
          error: "Name, location, and valid type (buyer/seller) are required.",
        },
        { status: 400 }
      );
    }

    const normalizedType = type.map((t) => t.toLowerCase());

    const updatedCompany = await ManageCompany.findByIdAndUpdate(
      id,
      {
        name,
        location,
        state,
        category,
        type: normalizedType,
        commodities,
        subCommodities,
        mobileNumbers,
        ...(typeof isSelfCompany === "boolean" ? { isSelfCompany } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company updated successfully", company: updatedCompany },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /managecompany/:id", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const deleted = await ManageCompany.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company", details: error.message },
      { status: 500 }
    );
  }
}
