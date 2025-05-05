import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

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
    console.error("Error in GET /managecompany/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const {
    name,
    location,
    category,
    state,
    mobileNumbers,
    commodities,
    subCommodities,
  } = await req.json();

  if (!id || !name || !location) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const flatLocations = Array.isArray(location)
      ? location.map((loc) =>
          typeof loc === "object" ? `${loc.name} ${loc.state}`.trim() : loc
        )
      : [];

    company.name = name;
    company.location = flatLocations;
    company.category = category || company.category;
    company.state = state || company.state;

    if (Array.isArray(mobileNumbers)) {
      const updatedMobileMap = new Map();

      for (const entry of company.mobileNumbers || []) {
        updatedMobileMap.set(entry.location, entry);
      }

      for (const entry of mobileNumbers) {
        if (entry?.location) {
          updatedMobileMap.set(entry.location, entry);
        }
      }

      company.mobileNumbers = Array.from(updatedMobileMap.values());
    }

    if (Array.isArray(commodities)) {
      const currentCommodities = company.commodities || [];
      company.commodities = Array.from(
        new Set([...currentCommodities, ...commodities])
      );
    }

    if (Array.isArray(subCommodities)) {
      const currentSubs = company.subCommodities || [];
      company.subCommodities = Array.from(
        new Set([...currentSubs, ...subCommodities])
      );
    }

    await company.save();

    return NextResponse.json(
      { message: "Company updated successfully", company },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    console.error("Error in DELETE /managecompany/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
