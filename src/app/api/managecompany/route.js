import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

await connectDB();

// ✅ Create or Update Company
export async function POST(req) {
  try {
    let { name, location, state } = await req.json();

    if (!name || !location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(location)) {
      location = [location];
    }

    state = state || "N.A"; // Default to "N.A" if state is missing

    let existingCompany = await ManageCompany.findOne({ name });
    if (existingCompany) {
      const locationExists = location.every((loc) =>
        existingCompany.location.includes(loc)
      );
      if (locationExists) {
        return NextResponse.json(
          { error: "Company with this location already exists" },
          { status: 409 }
        );
      }

      existingCompany.location = [
        ...new Set([...existingCompany.location, ...location]),
      ];
      existingCompany.state = state;
      await existingCompany.save();

      return NextResponse.json(
        { message: "Company location updated successfully", company: existingCompany },
        { status: 200 }
      );
    }

    const newCompany = new ManageCompany({ name, location, state });
    await newCompany.save();

    return NextResponse.json(
      { message: "Company created successfully", company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /managecompany:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create/update company" },
      { status: 500 }
    );
  }
}

// ✅ Get All Companies
export async function GET() {
  try {
    const companies = await ManageCompany.find();
    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /managecompany:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
