import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

await connectDB();

// ✅ Get Company by ID
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

// ✅ Update Company (PUT)
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { name, location, state } = await req.json();

    if (!id || !name || !location) {
      return NextResponse.json(
        { error: "ID, name, and location are required" },
        { status: 400 }
      );
    }

    const company = await ManageCompany.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    company.name = name;
    company.location = Array.isArray(location) ? location : [location];
    company.state = state || company.state;

    await company.save();

    return NextResponse.json(
      { message: "Company updated successfully", company },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /managecompany/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

// ✅ Delete Company
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
