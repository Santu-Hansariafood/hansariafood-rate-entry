import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (error) {
    console.error("GET /company/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const { name, category, type, isSelfCompany } = await req.json();

    const nameTrimmed = name?.trim();
    const categoryTrimmed = category?.trim();

    const typeArray = Array.isArray(type)
      ? type.map((t) => t.toLowerCase().trim())
      : [type?.toLowerCase().trim()];

    const validTypes = ["buyer", "seller"];
    const selectedTypes = typeArray.filter((t) => validTypes.includes(t));

    if (!nameTrimmed || !categoryTrimmed || selectedTypes.length === 0) {
      return NextResponse.json(
        {
          error:
            "Name, category, and at least one valid type (buyer/seller) are required",
        },
        { status: 400 },
      );
    }

    const duplicate = await Company.findOne({
      _id: { $ne: id },
      name: nameTrimmed,
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another company with this name already exists" },
        { status: 400 },
      );
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      {
        name: nameTrimmed,
        category: categoryTrimmed,
        type: selectedTypes,
        ...(isSelfCompany !== undefined && { isSelfCompany }),
      },
      { new: true },
    );

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company updated successfully", company: updatedCompany },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /company/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;

    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /company/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 },
    );
  }
}
