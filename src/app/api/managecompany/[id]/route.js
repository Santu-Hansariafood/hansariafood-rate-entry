import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

await connectDB();

export async function GET(req, { params }) {
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

export async function PUT(req, context) {
  await connectDB();

  const id = context.params.id;
  const { name, location, category, state } = await req.json();

  if (!id || !name || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const flatLocations = Array.isArray(location)
      ? location.map((loc) => `${loc.name} ${loc.state}`.trim())
      : [];

    company.name = name;
    company.location = flatLocations;
    company.category = category || company.category;
    company.state = state || company.state;

    await company.save();

    return NextResponse.json({ message: "Company updated", company }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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
