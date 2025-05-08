import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

// GET /api/managecompany/[id] – Fetch company by ID
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
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

// PUT /api/managecompany/[id] – Update company by ID
export async function PUT(req, { params }) {
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

    const {
      name,
      location,
      state,
      category,
      mobileNumbers = [],
      commodities = [],
      subCommodities = [],
    } = await req.json();

    if (!name || !Array.isArray(location) || !location.length) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Basic field updates
    company.name = name;
    company.location = location;
    company.state = state || company.state;
    company.category = category || company.category;

    // Update mobile numbers (per location + commodity)
    const existingMobileMap = new Map(
      (company.mobileNumbers || []).map((item) => [
        `${item.location}-${item.commodity}`,
        item,
      ])
    );
    mobileNumbers.forEach((num) => {
      const key = `${num.location}-${num.commodity}`;
      existingMobileMap.set(key, num);
    });
    company.mobileNumbers = Array.from(existingMobileMap.values());

    // Update commodities and subCommodities with de-duplication
    const combinedCommodities = [
      ...new Set([...company.commodities, ...commodities]),
    ];
    const combinedSubCommodities = [
      ...new Set([...company.subCommodities, ...subCommodities]),
    ];
    company.commodities = combinedCommodities;
    company.subCommodities = combinedSubCommodities;

    await company.save();

    return NextResponse.json(
      { message: "Company updated successfully", company },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/managecompany/[id] – Delete company by ID
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
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
