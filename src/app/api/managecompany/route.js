import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

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

    if (!Array.isArray(location)) {
      location = [location];
    }

    let existingCompany = await ManageCompany.findOne({ name });
    if (existingCompany) {
      const locationExists = location.every(loc => existingCompany.location.includes(loc));
      if (locationExists) {
        return NextResponse.json(
          { error: "Company with this location already exists" },
          { status: 409 }
        );
      }
      let newLocations = [...new Set([...existingCompany.location, ...location])];
      existingCompany.location = newLocations;
      await existingCompany.save();
      return NextResponse.json(
        { message: "Company location updated successfully", company: existingCompany },
        { status: 200 }
      );
    }

    const newCompany = new ManageCompany({ name, location, category });
    await newCompany.save();

    return NextResponse.json(
      { message: "Company created successfully", company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /manage-company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create/update company" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const companies = await ManageCompany.find();
    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /manage-company:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const deletedCompany = await ManageCompany.findByIdAndDelete(id);
    if (!deletedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /manage-company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
