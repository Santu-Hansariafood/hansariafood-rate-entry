import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { name, category, type } = await req.json();

    if (
      !name?.trim() ||
      !category?.trim() ||
      !type?.trim() ||
      !["buyer", "seller"].includes(type.toLowerCase())
    ) {
      return NextResponse.json(
        { error: "Name, category, and valid type are required" },
        { status: 400 }
      );
    }

    const existingCompany = await Company.findOne({
      _id: { $ne: id },
      name: name.trim(),
      type: type.toLowerCase(),
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Another company with this name and type already exists" },
        { status: 400 }
      );
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        category: category.trim(),
        type: type.toLowerCase(),
      },
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
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
