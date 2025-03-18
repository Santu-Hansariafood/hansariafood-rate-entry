import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";

await connectDB();

export async function POST(req) {
  try {
    let { name, location, category } = await req.json();

    if (!name || !location || !category) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Ensure location is an array
    if (!Array.isArray(location)) {
      location = [location];
    }

    let existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      let newLocations = [...new Set([...existingCompany.location, ...location])]; // Avoid duplicates
      existingCompany.location = newLocations;
      await existingCompany.save();
      return NextResponse.json(
        { message: "Company location updated successfully", company: existingCompany },
        { status: 200 }
      );
    }

    const newCompany = new Company({ name, location, category });
    await newCompany.save();

    return NextResponse.json(
      { message: "Company created successfully", company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create/update company" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    if (params?.id) {
      const company = await Company.findById(params.id);
      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ company }, { status: 200 });
    } else {
      const companies = await Company.find();
      return NextResponse.json({ companies }, { status: 200 });
    }
  } catch (error) {
    console.error("Error in GET /company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company/companies" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    let { name, location, category } = await req.json();

    if (!Array.isArray(location)) {
      location = [location];
    }

    const existingCompany = await Company.findOne({ name });
    if (existingCompany && existingCompany._id.toString() !== id) {
      return NextResponse.json(
        { error: "Another company with this name already exists" },
        { status: 409 }
      );
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { name, location, category },
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
    console.error("Error in PUT /company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
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
    console.error("Error in DELETE /company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
