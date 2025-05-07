import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

// GET /api/managecompany/[id] – View company by ID
export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (error) {
    console.error("GET /managecompany/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

// PUT /api/managecompany/[id] – Update company
export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const {
      name,
      location,
      category,
      state,
      mobileNumbers = [],
      commodities = [],
      subCommodities = [],
    } = await req.json();

    if (!id || !name || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Prepare transformed commodities
    const transformedCommodities = commodities.map((cmd) => ({
      name: cmd,
      subCommodities: subCommodities.filter((sub) =>
        typeof sub === "string" && sub.trim() !== ""
      ),
    }));

    // Update basic fields
    company.name = name;
    company.location = location;
    company.category = category || company.category;
    company.state = state || company.state;

    // Update mobile numbers (merge by location)
    const existingMobileMap = new Map(
      company.mobileNumbers.map((num) => [num.location, num])
    );
    mobileNumbers.forEach((num) => {
      existingMobileMap.set(num.location, num);
    });
    company.mobileNumbers = Array.from(existingMobileMap.values());

    // Update commodities (merge by commodity name)
    const commodityMap = new Map(
      company.commodities.map((cmd) => [cmd.name, cmd])
    );
    transformedCommodities.forEach((cmd) => {
      commodityMap.set(cmd.name, cmd);
    });
    company.commodities = Array.from(commodityMap.values());

    await company.save();

    return NextResponse.json(
      { message: "Company updated successfully", company },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /managecompany/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/managecompany/[id] – Delete company
export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedCompany = await ManageCompany.findByIdAndDelete(id);
    if (!deletedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /managecompany/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
