import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

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
    console.error("GET /managecompany/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const id = params.id;

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
      commodities = [],
      subCommodities = [],
      mobileNumbers = [],
      type = [],
      isSelfCompany,
    } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(location) || location.length === 0) {
      return NextResponse.json(
        { error: "At least one location is required." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(type) ||
      type.length === 0 ||
      !type.every((t) => ["buyer", "seller"].includes(t.toLowerCase()))
    ) {
      return NextResponse.json(
        { error: "Type must include buyer/seller." },
        { status: 400 }
      );
    }

    const normalizedType = [
      ...new Set(type.map((t) => t.toLowerCase())),
    ].sort();

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
    console.error("PUT /managecompany/[id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { id } = await params;

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
    console.error("DELETE /managecompany/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete company", details: error.message },
      { status: 500 }
    );
  }
}
